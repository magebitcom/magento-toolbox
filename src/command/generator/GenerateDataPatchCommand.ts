import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import DataPatchWizard, { DataPatchWizardData } from 'wizard/DataPatchWizard';
import DataPatchGenerator from 'generator/dataPatch/DataPatchGenerator';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateDataPatchCommand extends AbstractWizardCommand<DataPatchWizardData> {
  constructor() {
    super('magento-toolbox.generateDataPatch');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(contextModule: string | undefined): Promise<DataPatchWizardData> {
    return this.attachPreview(new DataPatchWizard()).show(contextModule);
  }

  protected buildGenerators(data: DataPatchWizardData): FileGenerator[] {
    return [new DataPatchGenerator(data)];
  }
}
