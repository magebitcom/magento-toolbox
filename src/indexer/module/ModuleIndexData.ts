import { WizardSelectOption } from 'types/webview';
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

  public getModule(name: string, caseSensitive = false): Module | undefined {
    return this.getValues().find(module =>
      caseSensitive ? module.name === name : module.name.toLowerCase() === name.toLowerCase()
    );
  }

  public getModulesByPrefix(prefix: string): Module[] {
    return this.getValues().filter(module => module.name.startsWith(prefix));
  }

  public getModuleByUri(uri: Uri, appOnly = true): Module | undefined {
    const module = this.getValues().find(module => {
      return uri.fsPath.startsWith(module.path) && (!appOnly || module.location === 'app');
    });

    return module;
  }
}
