import { WizardSelectOption } from 'webview/types';
import { Module } from './types';
import { IndexData } from 'indexer/IndexData';

export class ModuleIndexData extends IndexData<Module> {
  public getModuleOptions(filter?: (module: Module) => boolean): WizardSelectOption[] {
    return this.getValues()
      .filter(module => !filter || filter(module))
      .map(module => ({
        label: module.name,
        value: module.name,
      }));
  }

  public getModule(name: string): Module | undefined {
    return this.getValues().find(module => module.name === name);
  }
}
