import { Memoize } from 'typescript-memoize';
import EventsIndexer from './EventsIndexer';
import { Event } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { uniqBy } from 'lodash-es';

export class EventsIndexData extends AbstractIndexData<Event[]> {
  @Memoize({ tags: [EventsIndexer.KEY] })
  public getEvents(): Event[] {
    return this.getValues().flat();
  }

  public getEventNames(): string[] {
    return this.getEvents().map(event => event.name);
  }

  public getEventByName(eventName: string): Event | undefined {
    return this.getEvents().find(event => event.name === eventName);
  }

  public getEventsByPrefix(prefix: string): Event[] {
    const events = this.getEvents().filter(event => event.name.startsWith(prefix));
    return uniqBy(events, 'name');
  }

  public findEventsByObserverInstance(observerInstance: string): Event[] {
    return this.getEvents().filter(event =>
      event.observers.some(observer => observer.instance === observerInstance)
    );
  }
}
