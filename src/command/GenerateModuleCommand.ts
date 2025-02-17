import { Command } from 'command/Command';
import ModuleXmlGenerator from 'generator/module/ModuleXmlGenerator';
import ModuleRegistrationGenerator from 'generator/module/ModuleRegistrationGenerator';
import ModuleComposerGenerator from 'generator/module/ModuleComposerGenerator';
import ModuleLicenseGenerator from 'generator/module/ModuleLicenseGenerator';
import ModuleWizard, { ModuleWizardData, ModuleWizardComposerData } from 'wizard/ModuleWizard';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import { window } from 'vscode';
import Common from 'util/Common';
import WizzardClosedError from 'webview/error/WizzardClosedError';

export default class GenerateModuleCommand extends Command {
  constructor() {
    super('magento-toolbox.generateModule');
  }

  public async execute(...args: any[]): Promise<void> {
    const moduleWizard = new ModuleWizard();

    let data: ModuleWizardData | ModuleWizardComposerData;

    try {
      data = await moduleWizard.show();
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([
      new ModuleXmlGenerator(data),
      new ModuleRegistrationGenerator(data),
    ]);

    if (data.composer) {
      manager.addGenerator(new ModuleComposerGenerator(data));
    }

    if (data.license) {
      manager.addGenerator(new ModuleLicenseGenerator(data));
    }

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
