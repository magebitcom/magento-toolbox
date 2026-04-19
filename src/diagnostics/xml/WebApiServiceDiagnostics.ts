import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import PhpClassResolver from 'common/php/PhpClassResolver';

const PATTERN = '**/etc/webapi.xml';

export default class WebApiServiceDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('webApiService')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diagnostics: Diagnostic[] = [];

    const services = XmlWalker.collect(root, el => el.name === 'service');

    for (const service of services) {
      const classAttr = XmlWalker.attr(service, 'class');
      const methodAttr = XmlWalker.attr(service, 'method');

      let classOk = false;
      let classFqn: string | undefined;

      if (classAttr) {
        if (!classAttr.value) {
          const d = new Diagnostic(
            XmlRange.ofAttribute(classAttr),
            'Attribute value "class" can not be empty',
            DiagnosticSeverity.Error
          );
          d.code = DiagnosticCode.WebApiClassEmpty;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else if (!(await PhpClassResolver.classExists(classAttr.value))) {
          const d = new Diagnostic(
            XmlRange.ofAttributeValue(classAttr),
            `The class "${classAttr.value}" does not exist`,
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.WebApiClassMissing;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else {
          classOk = true;
          classFqn = classAttr.value;
        }
      }

      if (methodAttr) {
        if (!methodAttr.value) {
          const d = new Diagnostic(
            XmlRange.ofAttribute(methodAttr),
            'Attribute value "method" can not be empty',
            DiagnosticSeverity.Error
          );
          d.code = DiagnosticCode.WebApiMethodEmpty;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else if (classOk && classFqn) {
          const lookup = await PhpClassResolver.methodLookup(classFqn, methodAttr.value);

          if (!lookup || !lookup.exists) {
            const d = new Diagnostic(
              XmlRange.ofAttributeValue(methodAttr),
              `The method "${methodAttr.value}" does not exist in the service class`,
              DiagnosticSeverity.Warning
            );
            d.code = DiagnosticCode.WebApiMethodMissing;
            d.source = 'magento-toolbox';
            diagnostics.push(d);
          } else if (lookup.visibility !== 'public') {
            const d = new Diagnostic(
              XmlRange.ofAttributeValue(methodAttr),
              `The method "${methodAttr.value}" should have public access`,
              DiagnosticSeverity.Warning
            );
            d.code = DiagnosticCode.WebApiMethodNotPublic;
            d.source = 'magento-toolbox';
            (d as any).data = { classFile: lookup.file, methodName: methodAttr.value };
            diagnostics.push(d);
          }
        }
      }
    }

    return diagnostics;
  }
}
