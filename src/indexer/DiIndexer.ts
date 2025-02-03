import { RelativePattern, Uri } from 'vscode';
import { Indexer } from './Indexer';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { DiIndexData, DiType, DiPreference, DiPlugin, DiVirtualType } from './data/DiIndexData';

declare global {
  interface IndexerData {
    [DiIndexer.KEY]: DiIndexData;
  }
}

export default class DiIndexer extends Indexer {
  public static readonly KEY = 'di';

  private data: {
    types: DiType[];
    preferences: DiPreference[];
    virtualTypes: DiVirtualType[];
  };

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.data = {
      types: [],
      preferences: [],
      virtualTypes: [],
    };

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath) => {
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

  public getId(): keyof IndexerData {
    return DiIndexer.KEY;
  }

  public getName(): string {
    return 'Dependency Injection indexer';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/etc/di.xml');
  }

  public async indexFile(uri: Uri): Promise<void> {
    const xml = await this.readFile(uri);
    const parsed = this.xmlParser.parse(xml);
    const config = get(parsed, 'config', {});

    // Index types
    const types = get(config, 'type', []);
    for (const type of types) {
      const typeName = type['@_name'];
      if (!typeName) continue;

      const typeData: DiType = {
        name: typeName,
        plugins: [],
        diUri: uri,
        shared: type['@_shared'] === 'false' ? false : undefined,
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
            diUri: uri,
          };
          typeData.plugins.push(pluginData);
        }
      }

      // Handle arguments
      const arguments_ = get(type, 'arguments', {});
      if (arguments_ && typeof arguments_ === 'object') {
        typeData.arguments = arguments_;
      }

      this.data.types.push(typeData);
    }

    // Index preferences
    const preferences = get(config, 'preference', []);
    for (const pref of preferences) {
      const preference: DiPreference = {
        for: pref['@_for'],
        type: pref['@_type'],
        diUri: uri,
      };
      this.data.preferences.push(preference);
    }

    // Index virtual types
    const virtualTypes = get(config, 'virtualType', []);
    for (const vType of virtualTypes) {
      const virtualType: DiVirtualType = {
        name: vType['@_name'],
        type: vType['@_type'],
        shared: vType['@_shared'] === 'false' ? false : undefined,
        diUri: uri,
      };

      // Handle arguments
      const arguments_ = get(vType, 'arguments', {});
      if (arguments_ && typeof arguments_ === 'object') {
        virtualType.arguments = arguments_;
      }

      this.data.virtualTypes.push(virtualType);
    }
  }

  public getData(): DiIndexData {
    return new DiIndexData(
      [...this.data.types],
      [...this.data.preferences],
      [...this.data.virtualTypes]
    );
  }

  public clear(): void {
    this.data = {
      types: [],
      preferences: [],
      virtualTypes: [],
    };
  }
}
