import { Command } from 'command/Command';
import { ClassInfo } from 'common/php/ClassInfo';
import PluginSubjectInfo from 'common/php/PluginSubjectInfo';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import PluginClassGenerator from 'generator/plugin/PluginClassGenerator';
import PluginDiGenerator from 'generator/plugin/PluginDiGenerator';
import PhpParser from 'parser/php/Parser';
import { PhpMethod } from 'parser/php/PhpMethod';
import * as vscode from 'vscode';
import PluginContextWizard from 'wizard/PluginContextWizard';

export default class GenerateContextPluginCommand extends Command {
  constructor() {
    super('magento-toolbox.generateContextPlugin');
  }

  public async execute(...args: any[]): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor?.selection;
    if (!editor || !selection) {
      vscode.window.showErrorMessage('No selection');
      return;
    }

    const parser = new PhpParser();
    const phpFile = await parser.parse(editor.document.uri);
    const pluginSubjectInfo = new PluginSubjectInfo(phpFile);
    const phpClasses = pluginSubjectInfo.getValidPluginClasses();

    if (phpClasses.length === 0) {
      vscode.window.showErrorMessage('File does not contain any valid plugin classes');
      return;
    }

    const phpMethod = this.resolvePluginMethod(pluginSubjectInfo);
    const methods = pluginSubjectInfo.getValidPluginMethods();

    const wizard = new PluginContextWizard();

    const data = await wizard.show(
      methods.map(m => m.name),
      phpMethod?.name
    );

    const classInfo = new ClassInfo(phpFile);
    const method = classInfo.getMethodByName(phpClasses[0], data.method);

    if (!method) {
      vscode.window.showErrorMessage(`Method not found: ${data.method}`);
      return;
    }

    const manager = new FileGeneratorManager([
      new PluginClassGenerator(data, phpClasses[0], method),
      new PluginDiGenerator(data, phpClasses[0], method),
    ]);

    await manager.generate(vscode.workspace.workspaceFolders![0].uri);
    await manager.writeFiles();
    manager.openFirstFile();
  }

  private resolvePluginMethod(pluginSubjectInfo: PluginSubjectInfo): PhpMethod | undefined {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    const selection = editor?.selection;
    if (!editor || !selection) {
      vscode.window.showErrorMessage('No selection');
      return;
    }

    const wordRange = editor.document.getWordRangeAtPosition(selection.active);
    const word = editor.document.getText(wordRange);
    const methods = pluginSubjectInfo.getValidPluginMethods();

    return methods.find(m => {
      return m.name === word;
    });
  }
}
