import IndexStorage from 'common/IndexStorage';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/ModuleIndexer';
import { License } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardInput } from 'webview/types';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';

interface ModuleWizardBaseData {
  vendor: string;
  module: string;
  sequence: string[];
  license: License;
  version: string;
  copyright: string;
  composer: boolean;
}

export interface ModuleWizardData extends ModuleWizardBaseData {
  composer: false;
}

export interface ModuleWizardComposerData extends ModuleWizardBaseData {
  composer: true;
  composerName: string;
  composerDescription: string;
}

export default class ModuleWizard extends GeneratorWizard {
  public async show(): Promise<ModuleWizardData | ModuleWizardComposerData> {
    const moduleNameIndex = IndexStorage.get(ModuleIndexer.KEY);
    const modules = moduleNameIndex?.getModuleOptions() ?? [];

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new module');
    builder.setDescription('Generates the basic structure of a Magento2 module.');

    builder.addField(
      WizardFieldBuilder.text('vendor', 'Vendor*').setPlaceholder('Vendor name').build()
    );

    builder.addField(
      WizardFieldBuilder.text('module', 'Module*').setPlaceholder('Module name').build()
    );

    builder.addField(
      WizardFieldBuilder.select('sequence', 'Dependencies')
        .setOptions(modules)
        .setMultiple(true)
        .build()
    );
    builder.addField(
      WizardFieldBuilder.select('license', 'License')
        .setOptions([
          { label: 'No license', value: 'none' },
          { label: 'GPL V3', value: 'gplv3' },
          { label: 'OSL V3', value: 'oslv3' },
          { label: 'MIT', value: 'mit' },
          { label: 'Apache2', value: 'apache2' },
        ])
        .build()
    );
    builder.addField(
      WizardFieldBuilder.text('version', 'Version')
        .setPlaceholder('Version')
        .setInitialValue('1.0.0')
        .build()
    );
    builder.addField(WizardFieldBuilder.checkbox('composer', 'Generate composer.json').build());

    builder.addField(
      WizardFieldBuilder.text('composerName', 'Package name')
        .setPlaceholder('module/name')
        .addDependsOn('composer', true)
        .build()
    );

    builder.addField(
      WizardFieldBuilder.text('composerDescription', 'Package description')
        .setPlaceholder('Package description')
        .addDependsOn('composer', true)
        .build()
    );

    builder.addValidation('vendor', 'required|min:1');
    builder.addValidation('module', 'required|min:1');
    builder.addValidation('composerName', [{ required_if: ['composer', true] }]);
    builder.addValidationMessage('required_if.composerName', 'Package name is required');

    const data = await this.openWizard<ModuleWizardData | ModuleWizardComposerData>(
      builder.build()
    );

    return data;
  }
}
