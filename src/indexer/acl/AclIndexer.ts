import { RelativePattern, Uri } from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { get, map } from 'lodash-es';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';
import { IndexerKey } from 'types/indexer';
import { Acl } from './types';

interface Element {
  '@_id'?: string;
  '@_title'?: string;
  '@_description'?: string;
  '@_sortOrder'?: string;
  '@_disabled'?: string;
  resource?: Element[];
}

export default class AclIndexer extends Indexer<Acl[]> {
  public static readonly KEY = 'acl';

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: name => {
        return name === 'resource';
      },
    });
  }

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return AclIndexer.KEY;
  }

  public getName(): string {
    return 'acl.xml';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/acl.xml');
  }

  public async indexFile(uri: Uri): Promise<Acl[]> {
    const xml = await FileSystem.readFile(uri);

    const parsed = this.xmlParser.parse(xml);

    const events = get(parsed, 'config.acl.resources.resource', []);

    const acls = [];

    for (const event of events) {
      acls.push(...this.getResources(event, uri));
    }

    return acls;
  }

  private getResources(element: Element, uri: Uri): Acl[] {
    const parent = get(element, '@_id', undefined);
    const resources = get(element, 'resource', []);

    const acls: Acl[] = [];

    for (const resource of resources) {
      if (Array.isArray(resource.resource)) {
        acls.push(...this.getResources(resource, uri));
      }

      if (resource['@_id'] && resource['@_title']) {
        acls.push({
          id: resource['@_id'],
          title: resource['@_title'],
          description: resource['@_description'],
          sortOrder: resource['@_sortOrder'] ? parseInt(resource['@_sortOrder'], 10) : undefined,
          disabled: resource['@_disabled'] === 'true',
          parent,
          path: uri.fsPath,
        });
      }
    }

    return acls;
  }
}
