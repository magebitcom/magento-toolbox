import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import CronJobWizard, { CronJobWizardData } from 'wizard/CronJobWizard';
import CronJobClassGenerator from 'generator/cronJob/CronJobClassGenerator';
import CronJobXmlGenerator from 'generator/cronJob/CronJobXmlGenerator';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateCronJobCommand extends AbstractWizardCommand<CronJobWizardData> {
  constructor() {
    super('magento-toolbox.generateCronJob');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(contextModule: string | undefined): Promise<CronJobWizardData> {
    return this.attachPreview(new CronJobWizard()).show(contextModule);
  }

  protected buildGenerators(data: CronJobWizardData): FileGenerator[] {
    return [new CronJobClassGenerator(data), new CronJobXmlGenerator(data)];
  }
}
