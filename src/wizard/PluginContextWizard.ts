import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { MagentoScope } from 'types/global';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface PluginContextWizardData {
  module: string;
  method: string;
  className: string;
  name: string;
  type: 'before' | 'after' | 'around';
  scope: MagentoScope;
  sortOrder?: number;
}

export default class PluginContextWizard extends GeneratorWizard {
  public async show(
    allowedMethods: string[],
    initialMethod?: string
  ): Promise<PluginContextWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');
    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new plugin');
    builder.setDescription('Generates a plugin for a method.');

    const tab = new WizardTabBuilder();
    tab.setId('plugin');
    tab.setTitle('Plugin');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where plugin will be generated in'])
        .setOptions(modules)
        .setInitialValue(modules[0]?.value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('method', 'Method')
        .setOptions(allowedMethods.map(method => ({ label: method, value: method })))
        .setInitialValue(initialMethod)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Plugin class name')
        .setDescription(['E.g. "MyPlugin"'])
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('name', 'Plugin name').setDescription(['E.g. "my_plugin"']).build()
    );

    tab.addField(
      WizardFieldBuilder.select('type', 'Plugin type')
        .setOptions([
          { label: 'Before', value: 'before' },
          { label: 'After', value: 'after' },
          { label: 'Around', value: 'around' },
        ])
        .setInitialValue('before')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('scope', 'Scope')
        .setOptions(Object.values(MagentoScope).map(scope => ({ label: scope, value: scope })))
        .setInitialValue(MagentoScope.Global)
        .build()
    );

    tab.addField(WizardFieldBuilder.number('sortOrder', 'Sort order').build());

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('method', 'required');
    builder.addValidation('name', 'required');
    builder.addValidation('type', 'required');
    builder.addValidation('scope', 'required');
    builder.addValidation('sortOrder', 'numeric');

    const data = await this.openWizard<PluginContextWizardData>(builder.build());

    return data;
  }
}
