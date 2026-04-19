import { AbstractWizardCommand } from '../AbstractWizardCommand';
import ViewModelClassGenerator from 'generator/viewModel/ViewModelClassGenerator';
import ViewModelWizard, { ViewModelWizardData } from 'wizard/ViewModelWizard';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateViewModelCommand extends AbstractWizardCommand<ViewModelWizardData> {
  constructor() {
    super('magento-toolbox.generateViewModel');
  }

  protected showWizard(contextModule: string | undefined): Promise<ViewModelWizardData> {
    return this.attachPreview(new ViewModelWizard()).show(contextModule);
  }

  protected buildGenerators(data: ViewModelWizardData): FileGenerator[] {
    return [new ViewModelClassGenerator(data)];
  }
}
