import { Memoize } from 'typescript-memoize';
import { DiData, DiPlugin, DiPreference, DiType, DiVirtualType } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import DiIndexer from './DiIndexer';

const MAX_VIRTUAL_TYPE_CHAIN_DEPTH = 10;

export class DiIndexData extends AbstractIndexData<DiData> {
  @Memoize({
    tags: [DiIndexer.KEY],
  })
  public getTypes(): DiType[] {
    return this.getValues().flatMap(data => data.types);
  }

  @Memoize({
    tags: [DiIndexer.KEY],
  })
  public getPreferences(): DiPreference[] {
    return this.getValues().flatMap(data => data.preferences);
  }

  @Memoize({
    tags: [DiIndexer.KEY],
  })
  public getVirtualTypes(): DiVirtualType[] {
    return this.getValues().flatMap(data => data.virtualTypes);
  }

  @Memoize({
    tags: [DiIndexer.KEY],
  })
  protected getVirtualTypesByName(): Map<string, DiVirtualType> {
    const map = new Map<string, DiVirtualType>();
    for (const vt of this.getVirtualTypes()) {
      if (!map.has(vt.name)) {
        map.set(vt.name, vt);
      }
    }
    return map;
  }

  public findTypesByName(name: string): DiType[] {
    return this.getTypes().filter(type => type.name === name);
  }

  public findVirtualTypeByName(name: string): DiVirtualType | undefined {
    return this.getVirtualTypesByName().get(name);
  }

  public findPreferencesByType(type: string): DiPreference[] {
    return this.getPreferences().filter(pref => pref.for === type);
  }

  public findPluginsForType(type: string): DiPlugin[] {
    const typeData = this.findTypesByName(type);

    return typeData.flatMap(type => type.plugins);
  }

  public resolveVirtualTypeToConcrete(name: string): string | undefined {
    const seen = new Set<string>();
    const byName = this.getVirtualTypesByName();
    let current: string | undefined = name;

    for (let i = 0; i < MAX_VIRTUAL_TYPE_CHAIN_DEPTH; i++) {
      if (!current) return undefined;
      if (seen.has(current)) return undefined;
      seen.add(current);

      const vt = byName.get(current);
      if (!vt) {
        return current;
      }
      current = vt.type;
    }

    return undefined;
  }
}
