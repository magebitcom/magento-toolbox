import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Module } from './types';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import * as fs from 'fs';
import path from 'path';

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

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return ModuleIndexer.KEY;
  }

  public getName(): string {
    return 'module.xml';
  }

  public getPattern(): string {
    return '**/etc/module.xml';
  }

  public async indexFile(filePath: string): Promise<Module> {
    const xml = await fs.promises.readFile(filePath, 'utf8');

    const parsed = this.xmlParser.parse(xml);

    const moduleName = get(parsed, 'config.module.@_name');
    const setupVersion = get(parsed, 'config.module.@_setup_version');
    const sequence = get(parsed, 'config.module.sequence.module', []);

    return {
      name: moduleName,
      version: setupVersion,
      sequence: sequence.map((module: any) => module['@_name']),
      moduleXmlPath: filePath,
      path: path.join(filePath, '..', '..'),
      location: filePath.includes('vendor') ? 'vendor' : 'app',
    };
  }
}
