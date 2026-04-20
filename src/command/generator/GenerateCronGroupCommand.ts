import { AbstractWizardCommand } from '../AbstractWizardCommand';
import CronGroupWizard, { CronGroupWizardData } from 'wizard/CronGroupWizard';
import CronGroupXmlGenerator from 'generator/cronGroup/CronGroupXmlGenerator';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateCronGroupCommand extends AbstractWizardCommand<CronGroupWizardData> {
  constructor() {
    super('magento-toolbox.generateCronGroup');
  }

  protected showWizard(contextModule: string | undefined): Promise<CronGroupWizardData> {
    return this.attachPreview(new CronGroupWizard()).show(contextModule);
  }

  protected buildGenerators(data: CronGroupWizardData): FileGenerator[] {
    return [new CronGroupXmlGenerator(data)];
  }
}
