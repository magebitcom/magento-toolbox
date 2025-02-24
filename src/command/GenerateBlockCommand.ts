import { Command } from 'command/Command';
import BlockClassGenerator from 'generator/block/BlockClassGenerator';
import BlockWizard, { BlockWizardData } from 'wizard/BlockWizard';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import { Uri, window } from 'vscode';
import Common from 'util/Common';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';

export default class GenerateBlockCommand extends Command {
  constructor() {
    super('magento-toolbox.generateBlock');
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

    const blockWizard = new BlockWizard();

    let data: BlockWizardData;

    try {
      data = await blockWizard.show(contextModule);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([new BlockClassGenerator(data)]);

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
