import { WizardSelectOption } from 'webview/types';
import { Module } from './types';
import { IndexData } from 'indexer/IndexData';
import { Uri } from 'vscode';

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

  public getModuleByUri(uri: Uri): Module | undefined {
    const module = this.getValues().find(module => {
      return uri.fsPath.startsWith(module.path);
    });

    return module;
  }
}
