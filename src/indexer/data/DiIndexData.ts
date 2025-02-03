import { Uri } from 'vscode';
import IndexData from './IndexData';

export interface DiPlugin {
  name: string;
  type: string;
  before?: string;
  after?: string;
  disabled?: boolean;
  sortOrder?: number;
  diUri: Uri;
}

export interface DiArguments {
  [key: string]: any;
}

export interface DiPreference {
  for: string;
  type: string;
  diUri: Uri;
}

export interface DiBaseType {
  name: string;
  shared?: boolean;
  arguments?: DiArguments;
  diUri: Uri;
}

export interface DiType extends DiBaseType {
  plugins: DiPlugin[];
}

export interface DiVirtualType extends DiBaseType {
  type: string;
}

export class DiIndexData extends IndexData {
  public constructor(
    public types: DiType[] = [],
    public preferences: DiPreference[] = [],
    public virtualTypes: DiVirtualType[] = []
  ) {
    super();
  }

  public getTypes(): DiType[] {
    return this.types;
  }

  public getPreferences(): DiPreference[] {
    return this.preferences;
  }

  public getVirtualTypes(): DiVirtualType[] {
    return this.virtualTypes;
  }

  public findTypeByName(name: string): DiType | DiVirtualType | undefined {
    return (
      this.types.find(type => type.name === name) ||
      this.virtualTypes.find(type => type.name === name)
    );
  }

  public findPreferencesByType(type: string): DiPreference[] {
    return this.preferences.filter(pref => pref.for === type);
  }

  public findPluginsForType(type: string): DiPlugin[] {
    const foundType = this.types.find(t => t.name === type);
    return foundType?.plugins || [];
  }
}
