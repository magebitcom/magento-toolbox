import { Command } from 'command/Command';
import ModuleXmlGenerator from 'generator/module/ModuleXmlGenerator';
import ModuleRegistrationGenerator from 'generator/module/ModuleRegistrationGenerator';
import ModuleComposerGenerator from 'generator/module/ModuleComposerGenerator';
import ModuleLicenseGenerator from 'generator/module/ModuleLicenseGenerator';
import ModuleWizard from 'wizard/ModuleWizard';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import { workspace } from 'vscode';

export default class GenerateModuleCommand extends Command {
  constructor() {
    super('magento-toolbox.generateModule');
  }

  public async execute(...args: any[]): Promise<void> {
    const moduleWizard = new ModuleWizard();

    const data = await moduleWizard.show();

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

    await manager.generate(workspace.workspaceFolders![0].uri);
    await manager.writeFiles();
    manager.openFirstFile();
  }
}
