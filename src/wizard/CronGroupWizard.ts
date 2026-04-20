import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface CronGroupWizardData {
  module: string;
  groupId: string;
  scheduleGenerateEvery: number | string;
  scheduleAheadFor: number | string;
  scheduleLifetime: number | string;
  historyCleanupEvery: number | string;
  historySuccessLifetime: number | string;
  historyFailureLifetime: number | string;
  useSeparateProcess: boolean;
}

export default class CronGroupWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<CronGroupWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();
    builder.setTitle('Generate a cron group');
    builder.setDescription(
      'Declares a named cron group with its timing policy in etc/cron_groups.xml. ' +
        'Jobs that reference this group id in etc/crontab.xml will inherit these settings.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('cronGroup');
    tab.setTitle('Cron Group');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the group will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('groupId', 'Group ID')
        .setDescription(['snake_case identifier referenced by cron jobs'])
        .setPlaceholder('my_group')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('scheduleGenerateEvery', 'Schedule Generate Every (min)')
        .setDescription([
          'Frequency (in minutes) that schedules are written to the cron_schedule table.',
        ])
        .setInitialValue(15)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('scheduleAheadFor', 'Schedule Ahead For (min)')
        .setDescription([
          'Time (in minutes) in advance that schedules are written to the cron_schedule table.',
        ])
        .setInitialValue(20)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('scheduleLifetime', 'Schedule Lifetime (min)')
        .setDescription([
          'Window of time (in minutes) that a cron job must start or the cron job is considered missed ("too late" to run).',
        ])
        .setInitialValue(15)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('historyCleanupEvery', 'History Cleanup Every (min)')
        .setDescription(['Time (in minutes) that cron history is kept in the database.'])
        .setInitialValue(10)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('historySuccessLifetime', 'History Success Lifetime (min)')
        .setDescription([
          'Time (in minutes) that the record of successfully completed cron jobs is kept in the database.',
        ])
        .setInitialValue(60)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.number('historyFailureLifetime', 'History Failure Lifetime (min)')
        .setDescription([
          'Time (in minutes) that the record of failed cron jobs is kept in the database.',
        ])
        .setInitialValue(4320)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.checkbox('useSeparateProcess', 'Use separate process')
        .setDescription(["Run this cron group's jobs in a separate php process."])
        .setInitialValue(false)
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('groupId', ['required', `regex:/${Validation.SNAKE_CASE_REGEX.source}/`]);

    return this.openWizard<CronGroupWizardData>(builder.build());
  }
}
