import { RelativePattern, Uri } from 'vscode';
import { Indexer } from './Indexer';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Module, ModuleIndexData } from './data/ModuleIndexData';

declare global {
  interface IndexerData {
    [ModuleIndexer.KEY]: ModuleIndexData;
  }
}

export default class ModuleIndexer extends Indexer {
  public static readonly KEY = 'moduleName';

  private data: {
    modules: Module[];
  };

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.data = {
      modules: [],
    };

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath) => {
        return jpath === 'config.module.sequence.module';
      },
    });
  }

  public getId(): keyof IndexerData {
    return ModuleIndexer.KEY;
  }

  public getName(): string {
    return 'Module indexer';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/module.xml');
  }

  public async indexFile(uri: Uri): Promise<void> {
    const xml = await this.readFile(uri);

    const parsed = this.xmlParser.parse(xml);

    const moduleName = get(parsed, 'config.module.@_name');
    const setupVersion = get(parsed, 'config.module.@_setup_version');
    const sequence = get(parsed, 'config.module.sequence.module', []);

    this.data.modules.push({
      name: moduleName,
      version: setupVersion,
      sequence: sequence.map((module: any) => module['@_name']),
      uri: Uri.joinPath(uri, '..', '..'),
      location: uri.path.includes('vendor') ? 'vendor' : 'app',
    });
  }

  public getData(): ModuleIndexData {
    return new ModuleIndexData([...this.data.modules]);
  }

  public clear(): void {
    this.data.modules = [];
  }
}
