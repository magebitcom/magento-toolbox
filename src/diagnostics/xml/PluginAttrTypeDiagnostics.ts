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

export default class PluginAttrTypeDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('pluginAttrType')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    const plugins = XmlWalker.collect(root, el => el.name === 'plugin');

    for (const pluginEl of plugins) {
      const typeAttr = XmlWalker.attr(pluginEl, 'type');
      if (!typeAttr) continue;

      if (!typeAttr.value) {
        const d = new Diagnostic(
          XmlRange.ofAttribute(typeAttr),
          'Attribute value "type" can not be empty',
          DiagnosticSeverity.Error
        );
        d.code = DiagnosticCode.PluginAttrEmpty;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
        continue;
      }

      if (!(await PhpClassResolver.typeOrVirtualTypeExists(typeAttr.value))) {
        const d = new Diagnostic(
          XmlRange.ofAttributeValue(typeAttr),
          `The class "${typeAttr.value}" does not exist`,
          DiagnosticSeverity.Warning
        );
        d.code = DiagnosticCode.PluginAttrClassMissing;
        d.source = 'magento-toolbox';
        diagnostics.push(d);
      }
    }

    return diagnostics;
  }
}
