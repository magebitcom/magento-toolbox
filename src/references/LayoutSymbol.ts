import { Position, Range, TextDocument } from 'vscode';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import { XMLAttribute, XMLElement } from '@xml-tools/ast';

export type LayoutSymbolKind = 'block-name' | 'container-name' | 'handle';

export type LayoutSymbol = {
  kind: LayoutSymbolKind;
  name: string;
  range: Range;
};

const BLOCK_NAME_ELEMENTS = new Set(['block', 'referenceBlock']);
const CONTAINER_NAME_ELEMENTS = new Set(['container', 'referenceContainer']);
const MOVE_ELEMENT = 'move';
const UPDATE_ELEMENT = 'update';

export default class LayoutSymbolDetector {
  public static async detect(
    document: TextDocument,
    position: Position
  ): Promise<LayoutSymbol | undefined> {
    const tokenData = await XmlDocumentParser.parse(document);
    const offset = document.offsetAt(position);

    const attribute = findAttributeAt(tokenData.ast.rootElement ?? undefined, offset);
    if (!attribute) {
      return undefined;
    }

    const element = attribute.parent;
    const elementName = element.name ?? '';
    const attrName = attribute.key ?? '';
    const value = attribute.value ?? '';

    if (!value) {
      return undefined;
    }

    const range = attributeValueRange(attribute);

    if (attrName === 'name' && BLOCK_NAME_ELEMENTS.has(elementName)) {
      return { kind: 'block-name', name: value, range };
    }

    if (attrName === 'name' && CONTAINER_NAME_ELEMENTS.has(elementName)) {
      return { kind: 'container-name', name: value, range };
    }

    if (elementName === MOVE_ELEMENT && attrName === 'element') {
      return { kind: 'block-name', name: value, range };
    }

    if (elementName === MOVE_ELEMENT && attrName === 'destination') {
      return { kind: 'container-name', name: value, range };
    }

    if (elementName === UPDATE_ELEMENT && attrName === 'handle') {
      return { kind: 'handle', name: value, range };
    }

    return undefined;
  }
}

function findAttributeAt(root: XMLElement | undefined, offset: number): XMLAttribute | undefined {
  if (!root) {
    return undefined;
  }

  const elements: XMLElement[] = [root];
  while (elements.length) {
    const element = elements.pop() as XMLElement;

    for (const attribute of element.attributes) {
      const { position } = attribute;
      if (offset >= position.startOffset && offset <= position.endOffset) {
        return attribute;
      }
    }

    for (const child of element.subElements) {
      elements.push(child);
    }
  }

  return undefined;
}

function attributeValueRange(attribute: XMLAttribute): Range {
  return new Range(
    attribute.position.startLine - 1,
    attribute.position.startColumn + 1 + (attribute.key?.length ?? 0),
    attribute.position.endLine - 1,
    attribute.position.endColumn - 1
  );
}
