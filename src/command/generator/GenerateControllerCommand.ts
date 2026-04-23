import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import ControllerWizard, { ControllerWizardData } from 'wizard/ControllerWizard';
import ControllerClassGenerator from 'generator/controller/ControllerClassGenerator';
import ControllerRoutesGenerator from 'generator/controller/ControllerRoutesGenerator';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateControllerCommand extends AbstractWizardCommand<ControllerWizardData> {
  constructor() {
    super('magento-toolbox.generateController');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(contextModule: string | undefined): Promise<ControllerWizardData> {
    return this.attachPreview(new ControllerWizard()).show(contextModule);
  }

  protected buildGenerators(data: ControllerWizardData): FileGenerator[] {
    return [new ControllerClassGenerator(data), new ControllerRoutesGenerator(data)];
  }
}
