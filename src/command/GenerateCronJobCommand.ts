import { Command } from 'command/Command';
import CronJobWizard, { CronJobWizardData } from 'wizard/CronJobWizard';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import Common from 'util/Common';
import { Uri, window } from 'vscode';
import CronJobClassGenerator from 'generator/cronJob/CronJobClassGenerator';
import CronJobXmlGenerator from 'generator/cronJob/CronJobXmlGenerator';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';

export default class GenerateCronJobCommand extends Command {
  constructor() {
    super('magento-toolbox.generateCronJob');
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

    const cronJobWizard = new CronJobWizard();

    let data: CronJobWizardData;

    try {
      data = await cronJobWizard.show(contextModule);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([
      new CronJobClassGenerator(data),
      new CronJobXmlGenerator(data),
    ]);

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
