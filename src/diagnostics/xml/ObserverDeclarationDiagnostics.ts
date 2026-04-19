import { minimatch } from 'minimatch';
import { Diagnostic, DiagnosticSeverity, TextDocument } from 'vscode';
import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';
import XmlRange from 'diagnostics/util/XmlRange';
import DiagnosticConfig from 'diagnostics/util/DiagnosticConfig';
import { DiagnosticCode } from 'diagnostics/DiagnosticCodes';
import IndexManager from 'indexer/IndexManager';
import EventsIndexer from 'indexer/events/EventsIndexer';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { Uri } from 'vscode';

const PATTERN = '**/etc/**/events.xml';

export default class ObserverDeclarationDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'xml';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    if (!DiagnosticConfig.isEnabled('observerDeclaration')) return [];
    if (!minimatch(document.uri.fsPath, PATTERN, { matchBase: true })) return [];

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return [];

    const eventsIndex = IndexManager.getIndexData(EventsIndexer.KEY);
    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);
    const diagnostics: Diagnostic[] = [];

    const scope = this.getScopeFromPath(document.uri.fsPath);
    const seenInFile = new Map<string, Set<string>>();

    XmlWalker.walk(root, eventEl => {
      if (eventEl.name !== 'event') return;
      const eventName = XmlWalker.attrValue(eventEl, 'name');
      if (!eventName) return;

      for (const observerEl of eventEl.subElements) {
        if (observerEl.name !== 'observer') continue;

        const nameAttr = XmlWalker.attr(observerEl, 'name');
        if (!nameAttr?.value) continue;

        const inFileSet = seenInFile.get(eventName) ?? new Set<string>();
        if (inFileSet.has(nameAttr.value)) {
          const d = new Diagnostic(
            XmlRange.ofAttributeValue(nameAttr),
            'The observer name already used in this file. For more details see Inspection Description.',
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.ObserverDuplicateInFile;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        } else {
          inFileSet.add(nameAttr.value);
          seenInFile.set(eventName, inFileSet);
        }

        const disabled = XmlWalker.attrValue(observerEl, 'disabled') === 'true';

        if (disabled) {
          const enabledExists = (eventsIndex?.getEvents() ?? []).some(event => {
            if (event.name !== eventName) return false;
            return event.observers.some(
              obs => obs.name === nameAttr.value && event.diPath !== document.uri.fsPath
            );
          });

          if (!enabledExists) {
            const d = new Diagnostic(
              XmlRange.ofAttributeValue(nameAttr),
              'This observer does not exist to be disabled. For more details, see Inspection Description.',
              DiagnosticSeverity.Warning
            );
            d.code = DiagnosticCode.ObserverDisabledMissing;
            d.source = 'magento-toolbox';
            diagnostics.push(d);
          }
          continue;
        }

        const otherOccurrences = (eventsIndex?.getEvents() ?? []).filter(
          event =>
            event.name === eventName &&
            event.diPath !== document.uri.fsPath &&
            event.observers.some(obs => obs.name === nameAttr.value)
        );

        if (otherOccurrences.length > 0) {
          const otherPath = otherOccurrences[0].diPath;
          const otherModule = moduleIndex?.getModuleByUri(Uri.file(otherPath), false)?.name;

          const d = new Diagnostic(
            XmlRange.ofAttributeValue(nameAttr),
            `The observer name "${nameAttr.value}" for event "${eventName}" is already used in the module "${otherModule ?? 'unknown'}" (${scope} scope). For more details see Inspection Description.`,
            DiagnosticSeverity.Warning
          );
          d.code = DiagnosticCode.ObserverDuplicateInOtherPlaces;
          d.source = 'magento-toolbox';
          diagnostics.push(d);
        }
      }
    });

    return diagnostics;
  }

  private getScopeFromPath(fsPath: string): string {
    const normalized = fsPath.replace(/\\/g, '/');
    const match = normalized.match(/\/etc\/([^/]+)\/events\.xml$/);
    return match ? match[1] : 'global';
  }
}
