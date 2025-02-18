import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface BlockWizardData {
  module: string;
  name: string;
  path: string;
}

export default class BlockWizard extends GeneratorWizard {
  public async show(): Promise<BlockWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(m => m.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new block');
    builder.setDescription('Generates a new Magento2 block class.');

    const tab = new WizardTabBuilder();
    tab.setId('block');
    tab.setTitle('Block');

    tab.addField(WizardFieldBuilder.select('module', 'Module*').setOptions(modules).build());

    tab.addField(
      WizardFieldBuilder.text('name', 'Block Name*').setPlaceholder('Block class name').build()
    );

    tab.addField(
      WizardFieldBuilder.text('path', 'Block Directory*')
        .setPlaceholder('Block/Path')
        .setInitialValue('Block')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('name', 'required|min:1');
    builder.addValidation('path', 'required|min:1');

    const data = await this.openWizard<BlockWizardData>(builder.build());

    return data;
  }
}
