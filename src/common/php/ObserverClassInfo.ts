import { EventsIndexData } from 'indexer/events/EventsIndexData';
import EventsIndexer from 'indexer/events/EventsIndexer';
import IndexManager from 'indexer/IndexManager';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { Event } from 'indexer/events/types';
import { NodeKind } from 'parser/php/Parser';
import { Call } from 'php-parser';
import { Memoize } from 'typescript-memoize';

export default class ObserverClassInfo {
  private eventsIndexData: EventsIndexData | undefined;
  constructor(private readonly phpFile: PhpFile) {}

  public getObserverEvents(): Event[] {
    const phpClass = this.getClass();

    if (!phpClass) {
      return [];
    }

    const fqn = phpClass.namespace + '\\' + phpClass.name;

    if (!fqn) {
      return [];
    }

    const eventsIndexData = IndexManager.getIndexData(EventsIndexer.KEY);

    if (!eventsIndexData) {
      return [];
    }

    const events = eventsIndexData.findEventsByObserverInstance(fqn);

    return events;
  }

  @Memoize()
  public getEventDispatchCalls(): Call[] {
    const eventsIndexData = IndexManager.getIndexData(EventsIndexer.KEY);

    if (!eventsIndexData) {
      return [];
    }

    const phpClass = this.getClass();

    if (!phpClass) {
      return [];
    }

    const calls = phpClass.searchAst(NodeKind.Call);
    const dispatchCalls = calls.filter((call: any) => {
      if (call.what?.offset?.name === 'dispatch') {
        return true;
      }

      return false;
    });

    if (dispatchCalls.length === 0) {
      return [];
    }

    const eventNames = eventsIndexData.getEventNames();

    const eventDispatchCalls = dispatchCalls.filter((call: Call) => {
      if (call.arguments.length === 0) {
        return false;
      }

      const firstArgument = call.arguments[0];

      if (!firstArgument || firstArgument.kind !== NodeKind.String) {
        return false;
      }

      const eventName = (firstArgument as any).value;

      if (eventNames.includes(eventName)) {
        return true;
      }

      return false;
    });

    return eventDispatchCalls;
  }

  private getClass(): PhpClass | undefined {
    const phpClass = this.phpFile.classes[0];

    if (!phpClass) {
      return undefined;
    }

    return phpClass;
  }
}
