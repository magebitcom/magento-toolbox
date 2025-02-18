import { Command } from 'command/Command';
import BlockClassGenerator from 'generator/block/BlockClassGenerator';
import BlockWizard, { BlockWizardData } from 'wizard/BlockWizard';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import { window } from 'vscode';
import Common from 'util/Common';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import DynamicRowWizard from 'wizard/DynamicRowWizard';

export default class DynamicRowExampleCommand extends Command {
  constructor() {
    super('magento-toolbox.dynamicRowExample');
  }

  public async execute(...args: any[]): Promise<void> {
    const dynamicRowWizard = new DynamicRowWizard();

    let data: void;

    try {
      data = await dynamicRowWizard.show();
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }
  }
}
