import { WizardSelectOption } from 'webview/types';
import { Module } from './types';
import { Uri } from 'vscode';
import { AbstractIndexData } from 'indexer/AbstractIndexData';

export class ModuleIndexData extends AbstractIndexData<Module> {
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
