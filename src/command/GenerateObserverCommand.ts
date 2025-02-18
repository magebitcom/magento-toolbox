import { Command } from 'command/Command';
import ObserverWizard, { ObserverWizardData } from 'wizard/ObserverWizard';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import Common from 'util/Common';
import { window } from 'vscode';
import ObserverClassGenerator from 'generator/observer/ObserverClassGenerator';
import ObserverEventsGenerator from 'generator/observer/ObserverEventsGenerator';

export default class GenerateObserverCommand extends Command {
  constructor() {
    super('magento-toolbox.generateObserver');
  }

  public async execute(eventName?: string): Promise<void> {
    const observerWizard = new ObserverWizard();

    let data: ObserverWizardData;

    try {
      data = await observerWizard.show(eventName);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([
      new ObserverClassGenerator(data),
      new ObserverEventsGenerator(data),
    ]);

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
