import { Command } from 'command/Command';
import ViewModelClassGenerator from 'generator/viewModel/ViewModelClassGenerator';
import ViewModelWizard, { ViewModelWizardData } from 'wizard/ViewModelWizard';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import { Uri, window } from 'vscode';
import Common from 'util/Common';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';

export default class GenerateViewModelCommand extends Command {
  constructor() {
    super('magento-toolbox.generateViewModel');
  }

  public async execute(uri?: Uri): Promise<void> {
    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);
    let contextModule: string | undefined;

    const contextUri = uri || window.activeTextEditor?.document.uri;

    if (moduleIndex && contextUri) {
      const module = moduleIndex.getModuleByUri(contextUri);

      if (module) {
        contextModule = module.name;
      }
    }

    const viewModelWizard = new ViewModelWizard();

    let data: ViewModelWizardData;

    try {
      data = await viewModelWizard.show(contextModule);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([new ViewModelClassGenerator(data)]);

    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      window.showErrorMessage('No active workspace folder');
      return;
    }

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    manager.openFirstFile();
  }
}
