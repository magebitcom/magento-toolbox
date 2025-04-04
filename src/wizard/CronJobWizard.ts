import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface CronJobWizardData {
  module: string;
  className: string;
  cronName: string;
  cronGroup: string;
  cronSchedule: string;
}

export default class CronJobWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<CronJobWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new Cron Job');
    builder.setDescription('Generates a new cron job class and crontab.xml configuration.');

    const tab = new WizardTabBuilder();
    tab.setId('cronJob');
    tab.setTitle('Cron Job');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where cron job will be generated in'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name')
        .setDescription(['The class name for the cron job'])
        .setPlaceholder('SomeCronJob')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('cronName', 'Cron Name')
        .setDescription(['The name identifier for this cron job'])
        .setPlaceholder('module_name_cron_job')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('cronGroup', 'Cron Group')
        .setDescription(['The cron group for this job'])
        .setPlaceholder('default')
        .setInitialValue('default')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('cronSchedule', 'Cron Schedule')
        .setDescription(['The cron schedule expression (e.g. * * * * *)'])
        .setPlaceholder('* * * * *')
        .setInitialValue('* * * * *')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('cronName', 'required');
    builder.addValidation('cronGroup', 'required');
    builder.addValidation('cronSchedule', 'required');

    const data = await this.openWizard<CronJobWizardData>(builder.build());

    return data;
  }
}
