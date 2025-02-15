import { Memoize } from 'typescript-memoize';
import { DiData, DiPlugin, DiPreference, DiType, DiVirtualType } from './types';
import { IndexData } from 'indexer/IndexData';
import DiIndexer from './DiIndexer';

export class DiIndexData extends IndexData<DiData> {
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

  public findTypeByName(name: string): DiType | undefined {
    return this.getTypes().find(type => type.name === name);
  }

  public findVirtualTypeByName(name: string): DiVirtualType | undefined {
    return this.getVirtualTypes().find(type => type.name === name);
  }

  public findPreferencesByType(type: string): DiPreference[] {
    return this.getPreferences().filter(pref => pref.for === type);
  }

  public findPluginsForType(type: string): DiPlugin[] {
    const typeData = this.findTypeByName(type);
    return typeData?.plugins || [];
  }
}
