import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, Range, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import IndexManager from 'indexer/IndexManager';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import { MagentoScope } from 'types/global';
import Magento from 'util/Magento';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import { XMLAttribute, XMLElement } from '@xml-tools/ast';

const LAYOUT_PATTERNS = ['**/layout/*.xml', '**/page_layout/*.xml'];

export default class LayoutDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!this.isLayoutFile(document.uri.fsPath)) {
      return [];
    }

    const tokenData = await XmlDocumentParser.parse(document);
    const root = tokenData.ast.rootElement;
    if (!root) {
      return [];
    }

    const area = Magento.getLayoutArea(document.uri.fsPath);
    const diagnostics: Diagnostic[] = [];

    this.walk(root, element => {
      const nameAttr = this.attr(element, 'name');

      if (element.name === 'referenceBlock' && nameAttr?.value) {
        if (!this.blockExists(nameAttr.value, area)) {
          diagnostics.push(this.unknown('block', nameAttr));
        }
      }

      if (element.name === 'referenceContainer' && nameAttr?.value) {
        if (!this.containerExists(nameAttr.value, area)) {
          diagnostics.push(this.unknown('container', nameAttr));
        }
      }

      if (element.name === 'move') {
        const elementAttr = this.attr(element, 'element');
        const destinationAttr = this.attr(element, 'destination');

        if (
          elementAttr?.value &&
          !this.blockExists(elementAttr.value, area) &&
          !this.containerExists(elementAttr.value, area)
        ) {
          diagnostics.push(this.unknown('block or container', elementAttr));
        }

        if (
          destinationAttr?.value &&
          !this.blockExists(destinationAttr.value, area) &&
          !this.containerExists(destinationAttr.value, area)
        ) {
          diagnostics.push(this.unknown('block or container', destinationAttr));
        }
      }

      if (element.name === 'update') {
        const handleAttr = this.attr(element, 'handle');
        if (handleAttr?.value && !this.handleExists(handleAttr.value, area)) {
          diagnostics.push(this.unknown('handle', handleAttr));
        }
      }
    });

    return diagnostics;
  }

  private walk(root: XMLElement, visit: (element: XMLElement) => void): void {
    const stack: XMLElement[] = [root];
    while (stack.length) {
      const element = stack.pop() as XMLElement;
      visit(element);
      for (const child of element.subElements) {
        stack.push(child);
      }
    }
  }

  private attr(element: XMLElement, name: string): XMLAttribute | undefined {
    return element.attributes.find(a => a.key === name);
  }

  private unknown(kind: string, attribute: XMLAttribute): Diagnostic {
    const range = new Range(
      attribute.position.startLine - 1,
      attribute.position.startColumn + 1 + (attribute.key?.length ?? 0),
      attribute.position.endLine - 1,
      attribute.position.endColumn - 1
    );

    return new Diagnostic(
      range,
      `Unknown ${kind} "${attribute.value}".`,
      DiagnosticSeverity.Warning
    );
  }

  private blockExists(name: string, area: MagentoScope): boolean {
    const layout = IndexManager.getIndexData(LayoutIndexer.KEY);
    if (layout && layout.getBlocksByName(name, area).length > 0) {
      return true;
    }
    const pageLayout = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    if (pageLayout && pageLayout.getBlocksByName(name, area).length > 0) {
      return true;
    }
    return false;
  }

  private containerExists(name: string, area: MagentoScope): boolean {
    const layout = IndexManager.getIndexData(LayoutIndexer.KEY);
    if (layout && layout.getContainersByName(name, area).length > 0) {
      return true;
    }
    const pageLayout = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    if (pageLayout && pageLayout.getContainersByName(name, area).length > 0) {
      return true;
    }
    return false;
  }

  private handleExists(handle: string, area: MagentoScope): boolean {
    const layout = IndexManager.getIndexData(LayoutIndexer.KEY);
    if (layout && layout.getLayoutsByHandle(handle, area).length > 0) {
      return true;
    }
    return false;
  }

  private isLayoutFile(filePath: string): boolean {
    return LAYOUT_PATTERNS.some(pattern => minimatch(filePath, pattern, { matchBase: true }));
  }
}
