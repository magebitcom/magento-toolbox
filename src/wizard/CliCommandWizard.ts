import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface CliCommandWizardData {
  module: string;
  className: string;
  commandName: string;
  itemName: string;
  description: string;
}

export default class CliCommandWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<CliCommandWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new CLI command');
    builder.setDescription(
      'Generates a Symfony Console command class and registers it in etc/di.xml.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('cliCommand');
    tab.setTitle('CLI Command');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the CLI command will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name')
        .setDescription(['The PHP class name placed under Console/Command'])
        .setPlaceholder('DoSomething')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('commandName', 'Command Name')
        .setDescription(['Shown by bin/magento list — format: namespace:group:action'])
        .setPlaceholder('vendor:module:do-something')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('itemName', 'Registration Key')
        .setDescription([
          'Unique array key used in di.xml. Convention: snake_case with vendor/module prefix.',
        ])
        .setPlaceholder('vendor_module_do_something')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('description', 'Description')
        .setDescription(['Shown next to the command in bin/magento list'])
        .setPlaceholder('Does something useful')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('commandName', ['required', 'regex:/^[a-z][a-z0-9]*(?::[a-z0-9-]+)+$/']);
    builder.addValidation('itemName', [
      'required',
      `regex:/${Validation.SNAKE_CASE_REGEX.source}/`,
    ]);

    const data = await this.openWizard<CliCommandWizardData>(builder.build());

    return data;
  }
}
