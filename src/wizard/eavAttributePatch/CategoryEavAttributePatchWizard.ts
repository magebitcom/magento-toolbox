import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';
import { EAV_ATTRIBUTE_INPUT_OPTIONS, EAV_ATTRIBUTE_TYPE_OPTIONS } from './options';

export interface CategoryEavAttributePatchWizardData {
  module: string;
  className: string;
  attributeCode: string;
  attributeLabel: string;
  attributeType: string;
  attributeInput: string;
  required: boolean;
  sortOrder: number | string;
  group: string;
  revertable: boolean;
}

export default class CategoryEavAttributePatchWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<CategoryEavAttributePatchWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();
    builder.setTitle('Generate a category EAV attribute patch');
    builder.setDescription(
      'Generates a Data Patch that adds a new EAV attribute to the category entity.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('categoryEavAttribute');
    tab.setTitle('Category Attribute');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the patch will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name')
        .setDescription(['Patch class placed under Setup/Patch/Data'])
        .setPlaceholder('AddMyAttribute')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('attributeCode', 'Attribute Code')
        .setDescription(['Snake_case identifier stored in the DB'])
        .setPlaceholder('my_attribute')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('attributeLabel', 'Label').setPlaceholder('My Attribute').build()
    );

    tab.addField(
      WizardFieldBuilder.select('attributeType', 'Backend Type')
        .setOptions(EAV_ATTRIBUTE_TYPE_OPTIONS)
        .setInitialValue('varchar')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('attributeInput', 'Input')
        .setOptions(EAV_ATTRIBUTE_INPUT_OPTIONS)
        .setInitialValue('text')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('group', 'Group')
        .setDescription(['Attribute group in the category edit form'])
        .setInitialValue('General Information')
        .build()
    );

    tab.addField(WizardFieldBuilder.number('sortOrder', 'Sort Order').setInitialValue(100).build());

    tab.addField(WizardFieldBuilder.checkbox('required', 'Required').build());
    tab.addField(WizardFieldBuilder.checkbox('revertable', 'Revertable').build());

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('attributeCode', [
      'required',
      `regex:/${Validation.SNAKE_CASE_REGEX.source}/`,
    ]);
    builder.addValidation('attributeLabel', 'required');

    return this.openWizard<CategoryEavAttributePatchWizardData>(builder.build());
  }
}
