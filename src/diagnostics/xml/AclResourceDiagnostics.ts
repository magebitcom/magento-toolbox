import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import IndexManager from 'indexer/IndexManager';
import AclIndexer from 'indexer/acl/AclIndexer';

const PATTERN = '**/etc/acl.xml';

export default class AclResourceDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('aclResource')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const aclIndex = IndexManager.getIndexData(AclIndexer.KEY);
    const diagnostics: Diagnostic[] = [];

    XmlWalker.walk(root, element => {
      if (element.name !== 'resource') return;

      const idAttr = XmlWalker.attr(element, 'id');
      const titleAttr = XmlWalker.attr(element, 'title');

      if (idAttr && !idAttr.value) {
        const diagnostic = new Diagnostic(
          XmlRange.ofAttribute(idAttr),
          'Attribute value "id" can not be empty',
          DiagnosticSeverity.Error
        );
        diagnostic.code = DiagnosticCode.AclEmptyId;
        diagnostic.source = 'magento-toolbox';
        diagnostics.push(diagnostic);
        return;
      }

      if (!idAttr?.value) return;

      if (!titleAttr || !titleAttr.value) {
        const isOverride =
          aclIndex
            ?.getAcls()
            .some(acl => acl.id === idAttr.value && acl.path !== document.uri.fsPath) ?? false;

        if (isOverride) return;

        const diagnostic = new Diagnostic(
          XmlRange.ofElementOpenTag(element),
          'Attribute "title" is required',
          DiagnosticSeverity.Warning
        );
        diagnostic.code = DiagnosticCode.AclMissingTitle;
        diagnostic.source = 'magento-toolbox';
        diagnostics.push(diagnostic);
      }
    });

    return diagnostics;
  }
}
