import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface ViewModelWizardData {
  module: string;
  className: string;
  directory: string;
}

export default class ViewModelWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<ViewModelWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(m => m.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new ViewModel');
    builder.setDescription('Generates a new Magento2 ViewModel class.');

    const tab = new WizardTabBuilder();
    tab.setId('viewModel');
    tab.setTitle('ViewModel');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module*')
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name*')
        .setPlaceholder('ViewModel class name')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('directory', 'Directory*')
        .setPlaceholder('ViewModel/Path')
        .setInitialValue('ViewModel')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', 'required|min:1');
    builder.addValidation('directory', 'required|min:1');

    const data = await this.openWizard<ViewModelWizardData>(builder.build());

    return data;
  }
}
