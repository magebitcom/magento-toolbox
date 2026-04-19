import * as vscode from 'vscode';
import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import CommandAbortError from '../CommandAbortError';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PluginSubjectInfo from 'common/php/PluginSubjectInfo';
import PluginClassGenerator from 'generator/plugin/PluginClassGenerator';
import PluginDiGenerator from 'generator/plugin/PluginDiGenerator';
import PhpParser from 'parser/php/Parser';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';
import PluginContextWizard, { PluginContextWizardData } from 'wizard/PluginContextWizard';
import FileGenerator from 'generator/FileGenerator';

interface ContextPluginData {
  wizard: PluginContextWizardData;
  classlike: PhpClass | PhpInterface;
  method: PhpMethod;
}

export default class GenerateContextPluginCommand extends AbstractWizardCommand<ContextPluginData> {
  constructor() {
    super('magento-toolbox.generateContextPlugin');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected async showWizard(): Promise<ContextPluginData> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.selection) {
      vscode.window.showErrorMessage('No active editor');
      throw new CommandAbortError();
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
      throw new CommandAbortError();
    }

    const selectedMethod = this.resolveSelectedMethod(editor, pluginSubjectInfo);
    const methods = pluginSubjectInfo.getValidPluginMethods();

    const wizardData = await new PluginContextWizard().show(
      methods.map(m => m.name),
      selectedMethod?.name
    );

    const classlike = phpClasses[0] || phpInterfaces[0];
    const method = new ClasslikeInfo(phpFile).getMethodByName(classlike, wizardData.method);

    if (!method) {
      vscode.window.showErrorMessage(`Method not found: ${wizardData.method}`);
      throw new CommandAbortError();
    }

    return { wizard: wizardData, classlike, method };
  }

  protected buildGenerators(data: ContextPluginData): FileGenerator[] {
    return [
      new PluginClassGenerator(data.wizard, data.classlike, data.method),
      new PluginDiGenerator(data.wizard, data.classlike, data.method),
    ];
  }

  private resolveSelectedMethod(
    editor: vscode.TextEditor,
    pluginSubjectInfo: PluginSubjectInfo
  ): PhpMethod | undefined {
    const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
    const word = editor.document.getText(wordRange);
    return pluginSubjectInfo.getValidPluginMethods().find(m => m.name === word);
  }
}
