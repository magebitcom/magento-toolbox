import * as vscode from 'vscode';
import { Command } from './Command';
import { pickGenerator } from 'util/GeneratorPicker';

/**
 * Top-level entry point that opens a QuickPick listing every Magento Toolbox
 * generator command and runs the one the user picks. Serves both as a
 * standalone command palette shortcut and as the backing command for the
 * "Switch generator…" button inside any open wizard.
 */
export default class GenerateCommand extends Command {
  constructor() {
    super('magento-toolbox.generate');
  }

  public async execute(): Promise<void> {
    const picked = await pickGenerator();
    if (picked) {
      await vscode.commands.executeCommand(picked);
    }
  }
}
