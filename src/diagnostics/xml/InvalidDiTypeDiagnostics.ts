import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, Range, TextDocument } from 'vscode';
import { XMLElement, XMLTextContent } from '@xml-tools/ast';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import PhpClassResolver from 'common/php/PhpClassResolver';

const PATTERN = '**/etc/**/di.xml';

export default class InvalidDiTypeDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('invalidDiType')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    const types = XmlWalker.collect(root, el => {
      if (el.name !== 'type') return false;
      const parent = el.parent;
      return parent?.type === 'XMLElement' && parent.name === 'config';
    });

    for (const typeEl of types) {
      const nameAttr = XmlWalker.attr(typeEl, 'name');
      if (!nameAttr) continue;

      if (!nameAttr.value) {
        const d = new Diagnostic(
          XmlRange.ofAttribute(nameAttr),
          'Attribute value "name" can not be empty',
          DiagnosticSeverity.Error
        );
        d.code = DiagnosticCode.DiTypeEmpty;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
      } else if (!(await PhpClassResolver.typeOrVirtualTypeExists(nameAttr.value))) {
        const d = new Diagnostic(
          XmlRange.ofAttributeValue(nameAttr),
          `The class "${nameAttr.value}" does not exist`,
          DiagnosticSeverity.Warning
        );
        d.code = DiagnosticCode.DiTypeMissing;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
      }

      await this.checkObjectArguments(typeEl, diagnostics);
    }

    const virtualTypes = XmlWalker.collect(root, el => el.name === 'virtualType');
    for (const vt of virtualTypes) {
      await this.checkObjectArguments(vt, diagnostics);
    }

    return diagnostics;
  }

  private async checkObjectArguments(root: XMLElement, diagnostics: Diagnostic[]): Promise<void> {
    const args = XmlWalker.collect(
      root,
      el => el.name === 'argument' && XmlWalker.attrValue(el, 'xsi:type') === 'object'
    );

    for (const arg of args) {
      const text = this.getTextContent(arg);
      if (!text) {
        const d = new Diagnostic(
          XmlRange.ofElementOpenTag(arg),
          'Argument value "object" can not be empty',
          DiagnosticSeverity.Error
        );
        d.code = DiagnosticCode.DiTypeEmpty;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
        continue;
      }

      if (!(await PhpClassResolver.typeOrVirtualTypeExists(text.value))) {
        const d = new Diagnostic(
          this.rangeOfText(text),
          `The class "${text.value}" does not exist`,
          DiagnosticSeverity.Warning
        );
        d.code = DiagnosticCode.DiArgumentObjectMissing;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
      }
    }
  }

  private getTextContent(element: XMLElement): { value: string; node: XMLTextContent } | undefined {
    for (const child of element.textContents) {
      const raw = (child.text ?? '').trim();
      if (raw) return { value: raw, node: child };
    }
    return undefined;
  }

  private rangeOfText(text: { node: XMLTextContent }): Range {
    const pos = text.node.position;
    return new Range(pos.startLine - 1, pos.startColumn - 1, pos.endLine - 1, pos.endColumn - 1);
  }
}
