import { Command } from 'command/Command';
import { window } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { Uri } from 'vscode';

export default class JumpToModuleCommand extends Command {
  constructor() {
    super('magento-toolbox.jumpToModule');
  }

  public async execute(...args: any[]): Promise<void> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      window.showErrorMessage('Module index data not found');
      return;
    }

    const moduleName = await window.showQuickPick(moduleIndexData.getModuleOptions(), {
      placeHolder: 'Enter module name (e.g. Magento_Catalog)',
    });

    if (!moduleName) {
      return;
    }

    const module = moduleIndexData.getModule(moduleName.label);

    if (!module) {
      window.showErrorMessage(`Module ${moduleName} not found`);
      return;
    }

    const moduleXmlPath = Uri.file(`${module.path}/etc/module.xml`);

    const document = await window.showTextDocument(moduleXmlPath);
  }
}
