import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';

export default class ModuleDeclarationDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('moduleDeclaration')) return [];

    const expected = this.expectedNameFromPath(document.uri.fsPath);
    if (!expected) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const moduleEl = XmlWalker.collect(root, el => el.name === 'module')[0];
    if (!moduleEl) return [];

    const nameAttr = XmlWalker.attr(moduleEl, 'name');
    if (!nameAttr?.value) return [];
    if (nameAttr.value === expected) return [];

    const diagnostic = new Diagnostic(
      XmlRange.ofAttributeValue(nameAttr),
      `Provided module name "${nameAttr.value}" does not match expected "${expected}"`,
      DiagnosticSeverity.Warning
    );
    diagnostic.code = DiagnosticCode.ModuleNameMismatch;
    diagnostic.source = 'magento-toolbox';
    (diagnostic as any).data = { expectedName: expected };

    return [diagnostic];
  }

  private expectedNameFromPath(fsPath: string): string | undefined {
    const normalized = fsPath.replace(/\\/g, '/');
    const match = normalized.match(/\/app\/code\/([^/]+)\/([^/]+)\/etc\/module\.xml$/);
    if (!match) return undefined;

    const [, vendor, module] = match;
    return `${vendor}_${module}`;
  }
}
