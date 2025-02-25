import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { MagentoScope } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface PreferenceWizardData {
  module: string;
  parentClass: string;
  area: MagentoScope;
  className: string;
  directory: string;
  inheritClass: boolean;
}

export default class PreferenceWizard extends GeneratorWizard {
  public async show(parentClass?: string, contextModule?: string): Promise<PreferenceWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(m => m.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new preference');
    builder.setDescription('Generates a new Magento2 preference class.');

    const tab = new WizardTabBuilder();
    tab.setId('preference');
    tab.setTitle('Preference');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module*')
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('area', 'Area*')
        .setOptions(Object.values(MagentoScope).map(a => ({ label: a, value: a })))
        .setInitialValue(MagentoScope.Global)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('parentClass', 'Parent Class*')
        .setInitialValue(parentClass)
        .setPlaceholder('Parent class')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name*').setPlaceholder('Class name').build()
    );

    tab.addField(
      WizardFieldBuilder.text('directory', 'Directory*')
        .setInitialValue('Model')
        .setPlaceholder('Class directory')
        .build()
    );

    tab.addField(WizardFieldBuilder.checkbox('inheritClass', 'Inherit Class').build());

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('area', 'required');
    builder.addValidation('className', 'required|min:1');
    builder.addValidation('parentClass', 'required|min:1');
    builder.addValidation('directory', 'required|min:1');

    const data = await this.openWizard<PreferenceWizardData>(builder.build());

    return data;
  }
}
