import IndexStorage from 'common/IndexStorage';
import ModuleIndexer from 'indexer/ModuleIndexer';
import { MagentoScope } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';

export interface PluginContextWizardData {
  module: string;
  method: string;
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
    const moduleNameIndex = IndexStorage.get(ModuleIndexer.KEY);
    const modules = moduleNameIndex?.getModuleOptions() ?? [];
    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new plugin');
    builder.setDescription('Generates a plugin for a method.');

    builder.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where plugin will be generated in'])
        .setOptions(modules)
        .build()
    );

    builder.addField(
      WizardFieldBuilder.select('method', 'Method')
        .setOptions(allowedMethods.map(method => ({ label: method, value: method })))
        .setInitialValue(initialMethod)
        .build()
    );

    builder.addField(
      WizardFieldBuilder.text('name', 'Plugin name')
        .setDescription(['Name of the plugin class, e.g. "MyPlugin"'])
        .build()
    );

    builder.addField(
      WizardFieldBuilder.select('type', 'Plugin type')
        .setOptions([
          { label: 'Before', value: 'before' },
          { label: 'After', value: 'after' },
          { label: 'Around', value: 'around' },
        ])
        .setInitialValue('before')
        .build()
    );

    builder.addField(
      WizardFieldBuilder.select('scope', 'Scope')
        .setOptions(Object.values(MagentoScope).map(scope => ({ label: scope, value: scope })))
        .setInitialValue(MagentoScope.Global)
        .build()
    );

    builder.addField(WizardFieldBuilder.number('sort_order', 'Sort order').build());

    builder.addValidation('module', 'required');
    builder.addValidation('method', 'required');
    builder.addValidation('name', 'required');
    builder.addValidation('type', 'required');
    builder.addValidation('scope', 'required');
    builder.addValidation('sort_order', 'numeric');

    const data = await this.openWizard<PluginContextWizardData>(builder.build());

    return data;
  }
}
