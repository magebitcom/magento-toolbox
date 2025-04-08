import { Command } from 'command/Command';
import DataPatchWizard, { DataPatchWizardData } from 'wizard/DataPatchWizard';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import Common from 'util/Common';
import { Uri, window } from 'vscode';
import DataPatchGenerator from 'generator/dataPatch/DataPatchGenerator';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';

export default class GenerateDataPatchCommand extends Command {
  constructor() {
    super('magento-toolbox.generateDataPatch');
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

    const dataPatchWizard = new DataPatchWizard();

    let data: DataPatchWizardData;

    try {
      data = await dataPatchWizard.show(contextModule);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([new DataPatchGenerator(data)]);

    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      window.showErrorMessage('No active workspace folder');
      return;
    }

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    manager.openAllFiles();
  }
}
