import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';

const PATTERN = '**/layout/default.xml';

export default class CacheableFalseInDefaultLayoutDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('cacheableFalseInDefaultLayout')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    XmlWalker.walk(root, element => {
      if (element.name !== 'block') return;
      const cacheable = XmlWalker.attr(element, 'cacheable');
      if (!cacheable || cacheable.value !== 'false') return;

      const diagnostic = new Diagnostic(
        XmlRange.ofAttribute(cacheable),
        'Cacheable false attribute on the default layout will disable cache site-wide',
        DiagnosticSeverity.Warning
      );
      diagnostic.code = DiagnosticCode.CacheableFalseInDefaultLayout;
      diagnostic.source = 'magento-toolbox';
      diagnostics.push(diagnostic);
    });

    return diagnostics;
  }
}
