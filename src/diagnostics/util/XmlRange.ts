import { XMLAttribute, XMLElement } from '@xml-tools/ast';
import { Range } from 'vscode';

export default class XmlRange {
  public static ofAttributeValue(attribute: XMLAttribute): Range {
    return new Range(
      attribute.position.startLine - 1,
      attribute.position.startColumn + 1 + (attribute.key?.length ?? 0),
      attribute.position.endLine - 1,
      attribute.position.endColumn - 1
    );
  }

  public static ofAttribute(attribute: XMLAttribute): Range {
    return new Range(
      attribute.position.startLine - 1,
      attribute.position.startColumn - 1,
      attribute.position.endLine - 1,
      attribute.position.endColumn - 1
    );
  }

  public static ofElementOpenTag(element: XMLElement): Range {
    const open = element.syntax?.openName;
    if (open) {
      return new Range(
        open.startLine - 1,
        open.startColumn - 1,
        open.endLine - 1,
        open.endColumn - 1
      );
    }
    const pos = element.position;
    return new Range(pos.startLine - 1, pos.startColumn - 1, pos.endLine - 1, pos.endColumn - 1);
  }
}
