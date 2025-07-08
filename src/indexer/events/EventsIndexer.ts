import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import * as fs from 'fs';

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

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return EventsIndexer.KEY;
  }

  public getName(): string {
    return 'events.xml';
  }

  public getPattern(): string {
    return '**/etc/events.xml';
  }

  public async indexFile(path: string): Promise<Event[]> {
    const xml = await fs.promises.readFile(path, 'utf8');

    const parsed = this.xmlParser.parse(xml);

    const events = get(parsed, 'config.event', []);

    return events.map((event: any) => ({
      name: event['@_name'],
      diPath: path,
      observers:
        event.observer?.map((observer: any) => ({
          name: observer['@_name'],
          instance: observer['@_instance'],
        })) || [],
    }));
  }
}
