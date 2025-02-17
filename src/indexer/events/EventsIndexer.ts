import { RelativePattern, Uri } from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';
import { EventsIndexData } from './EventsIndexData';

declare global {
  interface IndexerData {
    [EventsIndexer.KEY]: EventsIndexData;
  }
}

export default class EventsIndexer extends Indexer<Event[]> {
  public static readonly KEY = 'events';

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath) => {
        return ['config.event', 'config.event.observer'].includes(jpath);
      },
    });
  }

  public getId(): keyof IndexerData {
    return EventsIndexer.KEY;
  }

  public getName(): string {
    return 'events.xml';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/events.xml');
  }

  public async indexFile(uri: Uri): Promise<Event[]> {
    const xml = await FileSystem.readFile(uri);

    const parsed = this.xmlParser.parse(xml);

    const events = get(parsed, 'config.event', []);

    return events.map((event: any) => ({
      name: event['@_name'],
      observers:
        event.observer?.map((observer: any) => ({
          name: observer['@_name'],
          instance: observer['@_instance'],
        })) || [],
    }));
  }
}
