import { Command } from 'command/Command';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
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
    const phpInterfaces = pluginSubjectInfo.getValidPluginInterfaces();

    if (phpClasses.length === 0 && phpInterfaces.length === 0) {
      vscode.window.showErrorMessage(
        'File does not contain any valid plugin classes or interfaces'
      );
      return;
    }

    const phpMethod = this.resolvePluginMethod(pluginSubjectInfo);
    const methods = pluginSubjectInfo.getValidPluginMethods();

    const wizard = new PluginContextWizard();

    const data = await wizard.show(
      methods.map(m => m.name),
      phpMethod?.name
    );

    const classlike = phpClasses[0] || phpInterfaces[0];
    const classlikeInfo = new ClasslikeInfo(phpFile);
    const method = classlikeInfo.getMethodByName(classlike, data.method);

    if (!method) {
      vscode.window.showErrorMessage(`Method not found: ${data.method}`);
      return;
    }

    const manager = new FileGeneratorManager([
      new PluginClassGenerator(data, classlike, method),
      new PluginDiGenerator(data, classlike, method),
    ]);

    const workspaceFolder = vscode.workspace.workspaceFolders![0];

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
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
