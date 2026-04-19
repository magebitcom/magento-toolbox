import { Diagnostic, DiagnosticSeverity, Range, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';

const VALID_AREAS = new Set([
  'adminhtml',
  'frontend',
  'crontab',
  'webapi_rest',
  'webapi_soap',
  'graphql',
]);

const KNOWN_ETC_XML = new Set([
  'di.xml',
  'routes.xml',
  'menu.xml',
  'acl.xml',
  'webapi.xml',
  'events.xml',
  'crontab.xml',
  'widget.xml',
  'page_types.xml',
  'sections.xml',
  'config.xml',
  'system.xml',
  'indexer.xml',
]);

export default class ModuleScopeDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('moduleScope')) return [];

    const info = this.scopeInfo(document.uri.fsPath);
    if (!info || VALID_AREAS.has(info.area)) return [];

    const diagnostic = new Diagnostic(
      new Range(0, 0, 0, 1),
      'The area of this config file is wrong. Please check the spelling of the parent directory, it should be equal to one of the following: adminhtml, frontend, crontab, webapi_rest, webapi_soap, graphql.',
      DiagnosticSeverity.Warning
    );
    diagnostic.code = DiagnosticCode.ModuleScopeWrongArea;
    diagnostic.source = 'magento-toolbox';

    return [diagnostic];
  }

  private scopeInfo(fsPath: string): { area: string; filename: string } | undefined {
    const normalized = fsPath.replace(/\\/g, '/');
    const match = normalized.match(/\/etc\/([^/]+)\/([^/]+\.xml)$/);
    if (!match) return undefined;

    const [, area, filename] = match;
    if (!KNOWN_ETC_XML.has(filename)) return undefined;

    return { area, filename };
  }
}
