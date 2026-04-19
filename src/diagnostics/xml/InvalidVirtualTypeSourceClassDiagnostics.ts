import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import PhpClassResolver from 'common/php/PhpClassResolver';

const PATTERN = '**/etc/**/di.xml';

export default class InvalidVirtualTypeSourceClassDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('invalidVirtualTypeSource')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    const virtualTypes = XmlWalker.collect(root, el => el.name === 'virtualType');

    for (const el of virtualTypes) {
      const typeAttr = XmlWalker.attr(el, 'type');
      if (!typeAttr) continue;

      if (!typeAttr.value) {
        const d = new Diagnostic(
          XmlRange.ofAttribute(typeAttr),
          'Attribute value "type" can not be empty',
          DiagnosticSeverity.Error
        );
        d.code = DiagnosticCode.VirtualTypeSourceEmpty;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
        continue;
      }

      if (!(await PhpClassResolver.classExists(typeAttr.value))) {
        const d = new Diagnostic(
          XmlRange.ofAttributeValue(typeAttr),
          `The class "${typeAttr.value}" does not exist`,
          DiagnosticSeverity.Warning
        );
        d.code = DiagnosticCode.VirtualTypeSourceMissing;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
      }
    }

    return diagnostics;
  }
}
