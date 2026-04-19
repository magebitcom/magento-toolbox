import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument, Uri } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import IndexManager from 'indexer/IndexManager';
import DiIndexer from 'indexer/di/DiIndexer';
import ModuleIndexer from 'indexer/module/ModuleIndexer';

const PATTERN = '**/etc/**/di.xml';

export default class PluginDeclarationDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('pluginDeclaration')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const diIndex = IndexManager.getIndexData(DiIndexer.KEY);
    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);
    const diagnostics: Diagnostic[] = [];

    const scope = this.getScopeFromPath(document.uri.fsPath);
    const seenInFile = new Map<string, Set<string>>();

    XmlWalker.walk(root, typeEl => {
      if (typeEl.name !== 'type') return;
      const targetType = XmlWalker.attrValue(typeEl, 'name');
      if (!targetType) return;

      for (const pluginEl of typeEl.subElements) {
        if (pluginEl.name !== 'plugin') continue;

        const nameAttr = XmlWalker.attr(pluginEl, 'name');
        if (!nameAttr?.value) continue;

        const inFileSet = seenInFile.get(targetType) ?? new Set<string>();
        if (inFileSet.has(nameAttr.value)) {
          const d = new Diagnostic(
            XmlRange.ofAttributeValue(nameAttr),
            'The plugin name already used in this file. For more details see Inspection Description.',
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.PluginDuplicateInFile;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else {
          inFileSet.add(nameAttr.value);
          seenInFile.set(targetType, inFileSet);
        }

        const disabled = XmlWalker.attrValue(pluginEl, 'disabled') === 'true';

        if (disabled) {
          const enabledExists = (diIndex?.findPluginsForType(targetType) ?? []).some(
            p => p.name === nameAttr.value && p.diPath !== document.uri.fsPath
          );

          if (!enabledExists) {
            const d = new Diagnostic(
              XmlRange.ofAttributeValue(nameAttr),
              'This plugin does not exist to be disabled.',
              DiagnosticSeverity.Warning
            );
            d.code = DiagnosticCode.PluginDisabledMissing;
            d.source = 'magento-toolbox';
            diagnostics.push(d);
          }
          continue;
        }

        const otherOccurrences = (diIndex?.findPluginsForType(targetType) ?? []).filter(
          p => p.name === nameAttr.value && p.diPath !== document.uri.fsPath
        );

        if (otherOccurrences.length > 0) {
          const otherPath = otherOccurrences[0].diPath;
          const otherModule = moduleIndex?.getModuleByUri(Uri.file(otherPath), false)?.name;

          const d = new Diagnostic(
            XmlRange.ofAttributeValue(nameAttr),
            `The plugin name "${nameAttr.value}" for targeted "${targetType}" class is already used in the module "${otherModule ?? 'unknown'}" (${scope} scope). For more details see Inspection Description.`,
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.PluginDuplicateInOtherPlaces;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        }
      }
    });

    return diagnostics;
  }

  private getScopeFromPath(fsPath: string): string {
    const normalized = fsPath.replace(/\\/g, '/');
    const match = normalized.match(/\/etc\/([^/]+)\/di\.xml$/);
    return match ? match[1] : 'global';
  }
}
