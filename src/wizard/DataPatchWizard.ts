import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';
import Validation from 'common/Validation';

export interface DataPatchWizardData {
  module: string;
  className: string;
  revertable: boolean;
}

export default class DataPatchWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<DataPatchWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new Data Patch');
    builder.setDescription('Generates a new Data Patch for a module.');

    const tab = new WizardTabBuilder();
    tab.setId('dataPatch');
    tab.setTitle('Data Patch');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where data patch will be generated in'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name')
        .setDescription(['The class name for the data patch'])
        .setPlaceholder('YourPatchName')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.checkbox('revertable', 'Revertable').setInitialValue(false).build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);

    const data = await this.openWizard<DataPatchWizardData>(builder.build());

    return data;
  }
}
