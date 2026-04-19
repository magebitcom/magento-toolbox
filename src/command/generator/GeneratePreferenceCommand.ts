import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import { TextDocument, window } from 'vscode';
import PreferenceWizard, { PreferenceWizardData } from 'wizard/PreferenceWizard';
import PreferenceClassGenerator from 'generator/preference/PreferenceClassGenerator';
import PreferenceDiGenerator from 'generator/preference/PreferenceDiGenerator';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import FileGenerator from 'generator/FileGenerator';

export default class GeneratePreferenceCommand extends AbstractWizardCommand<PreferenceWizardData> {
  constructor() {
    super('magento-toolbox.generatePreference');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected async showWizard(contextModule: string | undefined): Promise<PreferenceWizardData> {
    const parentClassName = await this.resolveParentClassName(window.activeTextEditor?.document);
    return new PreferenceWizard().show(parentClassName, contextModule);
  }

  protected buildGenerators(data: PreferenceWizardData): FileGenerator[] {
    return [new PreferenceClassGenerator(data), new PreferenceDiGenerator(data)];
  }

  private async resolveParentClassName(
    document: TextDocument | undefined
  ): Promise<string | undefined> {
    if (!document) {
      return undefined;
    }

    const phpFile = await PhpDocumentParser.parse(document);
    return new ClasslikeInfo(phpFile).getNamespace();
  }
}
