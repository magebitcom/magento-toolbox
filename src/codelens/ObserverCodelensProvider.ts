import ObserverClassInfo from 'common/php/ObserverClassInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import EventsIndexer from 'indexer/events/EventsIndexer';
import IndexManager from 'indexer/IndexManager';
import { NodeKind } from 'parser/php/Parser';
import { Call } from 'php-parser';
import Position from 'util/Position';
import { CodeLens, CodeLensProvider, TextDocument } from 'vscode';

export default class ObserverCodelensProvider implements CodeLensProvider {
  public async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    const codelenses: CodeLens[] = [];

    const phpFile = await PhpDocumentParser.parse(document);

    const observerClassInfo = new ObserverClassInfo(phpFile);

    const eventDispatchCalls = observerClassInfo.getEventDispatchCalls();

    if (eventDispatchCalls.length === 0) {
      return codelenses;
    }

    codelenses.push(...this.getEventDispatchCodeLenses(eventDispatchCalls));

    return codelenses;
  }

  private getEventDispatchCodeLenses(eventDispatchCalls: Call[]): CodeLens[] {
    const eventsIndexData = IndexManager.getIndexData(EventsIndexer.KEY);

    if (!eventsIndexData) {
      return [];
    }

    const codelenses: CodeLens[] = [];

    for (const eventDispatchCall of eventDispatchCalls) {
      const args = eventDispatchCall.arguments;

      if (args.length === 0) {
        continue;
      }

      const firstArg = args[0];

      if (!firstArg || firstArg.kind !== NodeKind.String || !firstArg.loc) {
        continue;
      }

      const eventName = (firstArg as any).value;

      const event = eventsIndexData.getEventByName(eventName);

      if (!event) {
        continue;
      }

      const range = Position.phpAstLocationToVsCodeRange(firstArg.loc);

      const codelens = new CodeLens(range, {
        title: 'Create an Observer',
        command: 'magento-toolbox.generateObserver',
        arguments: [event.name],
      });

      codelenses.push(codelens);
    }

    return codelenses;
  }
}
