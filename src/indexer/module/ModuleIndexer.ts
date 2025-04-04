import { RelativePattern, Uri } from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Module } from './types';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';

export default class ModuleIndexer extends Indexer<Module> {
  public static readonly KEY = 'module';

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath) => {
        return jpath === 'config.module.sequence.module';
      },
    });
  }

  public getId(): string {
    return ModuleIndexer.KEY;
  }

  public getName(): string {
    return 'module.xml';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/module.xml');
  }

  public async indexFile(uri: Uri): Promise<Module> {
    const xml = await FileSystem.readFile(uri);

    const parsed = this.xmlParser.parse(xml);

    const moduleName = get(parsed, 'config.module.@_name');
    const setupVersion = get(parsed, 'config.module.@_setup_version');
    const sequence = get(parsed, 'config.module.sequence.module', []);

    return {
      name: moduleName,
      version: setupVersion,
      sequence: sequence.map((module: any) => module['@_name']),
      moduleXmlPath: uri.fsPath,
      path: Uri.joinPath(uri, '..', '..').fsPath,
      location: uri.fsPath.includes('vendor') ? 'vendor' : 'app',
    };
  }
}
