import { RelativePattern, Uri } from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import FileSystem from 'util/FileSystem';
import { DiData, DiPlugin, DiPreference, DiType, DiVirtualType } from './types';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';

export default class DiIndexer extends Indexer<DiData> {
  public static readonly KEY = 'di';

  protected xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (_name, jpath) => {
        return [
          'config.type',
          'config.preference',
          'config.virtualType',
          'config.type.plugin',
          'config.type.arguments',
          'config.virtualType.arguments',
        ].includes(jpath);
      },
    });
  }

  public getId(): IndexerKey {
    return DiIndexer.KEY;
  }

  public getName(): string {
    return 'di.xml';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/di.xml');
  }

  public async indexFile(uri: Uri): Promise<DiData> {
    const xml = await FileSystem.readFile(uri);
    const parsed = this.xmlParser.parse(xml);
    const config = get(parsed, 'config', {});
    const data: DiData = {
      types: [],
      preferences: [],
      virtualTypes: [],
      plugins: [],
    };

    // Index types
    const types = get(config, 'type', []);
    for (const type of types) {
      const typeName = type['@_name'];
      if (!typeName) continue;

      const typeData: DiType = {
        name: typeName,
        plugins: [],
        shared: type['@_shared'] === 'false' ? false : undefined,
        diPath: uri.fsPath,
      };

      // Handle plugins
      const plugins = get(type, 'plugin', []);

      if (Array.isArray(plugins)) {
        for (const plugin of plugins) {
          const pluginData: DiPlugin = {
            name: plugin['@_name'],
            type: plugin['@_type'],
            sortOrder: plugin['@_sortOrder'] ? parseInt(plugin['@_sortOrder']) : undefined,
            disabled: plugin['@_disabled'] === 'true',
            before: plugin['@_before'],
            after: plugin['@_after'],
            diPath: uri.fsPath,
          };
          typeData.plugins.push(pluginData);
        }
      }

      // Handle arguments
      const arguments_ = get(type, 'arguments', {});
      if (arguments_ && typeof arguments_ === 'object') {
        typeData.arguments = arguments_;
      }

      data.types.push(typeData);
    }

    // Index preferences
    const preferences = get(config, 'preference', []);
    for (const pref of preferences) {
      const preference: DiPreference = {
        for: pref['@_for'],
        type: pref['@_type'],
        diPath: uri.fsPath,
      };
      data.preferences.push(preference);
    }

    // Index virtual types
    const virtualTypes = get(config, 'virtualType', []);
    for (const vType of virtualTypes) {
      const virtualType: DiVirtualType = {
        name: vType['@_name'],
        type: vType['@_type'],
        shared: vType['@_shared'] === 'false' ? false : undefined,
        diPath: uri.fsPath,
      };

      // Handle arguments
      const arguments_ = get(vType, 'arguments', {});
      if (arguments_ && typeof arguments_ === 'object') {
        virtualType.arguments = arguments_;
      }

      data.virtualTypes.push(virtualType);
    }

    return data;
  }
}
