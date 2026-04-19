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

export default class PreferenceDeclarationDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('preferenceDeclaration')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    const preferences = XmlWalker.collect(root, el => el.name === 'preference');

    for (const el of preferences) {
      const forAttr = XmlWalker.attr(el, 'for');
      const typeAttr = XmlWalker.attr(el, 'type');

      if (forAttr) {
        if (!forAttr.value) {
          const d = new Diagnostic(
            XmlRange.ofAttribute(forAttr),
            'Attribute value "for" can not be empty',
            DiagnosticSeverity.Error
          );
          d.code = DiagnosticCode.PreferenceForEmpty;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else if (!(await PhpClassResolver.classExists(forAttr.value))) {
          const d = new Diagnostic(
            XmlRange.ofAttributeValue(forAttr),
            `The class "${forAttr.value}" does not exist`,
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.PreferenceForMissing;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        }
      }

      if (typeAttr) {
        if (!typeAttr.value) {
          const d = new Diagnostic(
            XmlRange.ofAttribute(typeAttr),
            'Attribute value "type" can not be empty',
            DiagnosticSeverity.Error
          );
          d.code = DiagnosticCode.PreferenceTypeEmpty;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else if (!(await PhpClassResolver.typeOrVirtualTypeExists(typeAttr.value))) {
          const d = new Diagnostic(
            XmlRange.ofAttributeValue(typeAttr),
            `The class "${typeAttr.value}" does not exist`,
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.PreferenceTypeMissing;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        }
      }
    }

    return diagnostics;
  }
}
