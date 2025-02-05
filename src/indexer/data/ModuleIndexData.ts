import { Uri } from 'vscode';
import { WizardSelectOption } from 'webview/types';
import IndexData from './IndexData';
import { JsonObject } from 'typescript-json-serializer';

export interface Module {
  name: string;
  version?: string;
  sequence: string[];
  uri: Uri;
  location: 'vendor' | 'app';
}

@JsonObject()
export class ModuleIndexData extends IndexData {
  public constructor(public modules: Module[] = []) {
    super();
  }

  public getModules(): Module[] {
    return this.modules;
  }

  public getModuleOptions(exclude: string[] = []): WizardSelectOption[] {
    return this.modules
      .filter(module => !exclude.includes(module.name))
      .map(module => ({
        label: module.name,
        value: module.name,
      }));
  }

  public getModule(name: string): Module | undefined {
    return this.modules.find(module => module.name === name);
  }
}
