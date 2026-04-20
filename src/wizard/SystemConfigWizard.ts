import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface SystemConfigSectionRow {
  id: string;
  label: string;
  sortOrder: number | string;
  tab: string;
  resource: string;
}

export interface SystemConfigGroupRow {
  sectionRef: string;
  id: string;
  label: string;
  sortOrder: number | string;
}

export interface SystemConfigFieldRow {
  sectionRef: string;
  groupRef: string;
  id: string;
  label: string;
  type: string;
  sortOrder: number | string;
  default?: string;
  sourceModel?: string;
  comment?: string;
}

export interface SystemConfigWizardData {
  module: string;
  generateAcl: boolean;
  sections: SystemConfigSectionRow[];
  groups: SystemConfigGroupRow[];
  fields: SystemConfigFieldRow[];
}

const FIELD_TYPE_OPTIONS = [
  { label: 'text', value: 'text' },
  { label: 'textarea', value: 'textarea' },
  { label: 'select', value: 'select' },
  { label: 'multiselect', value: 'multiselect' },
  { label: 'password', value: 'password' },
  { label: 'obscure', value: 'obscure' },
];

const COMMON_SOURCE_MODELS = [
  'Magento\\Config\\Model\\Config\\Source\\Yesno',
  'Magento\\Config\\Model\\Config\\Source\\Enabledisable',
  'Magento\\Config\\Model\\Config\\Source\\Locale',
  'Magento\\Config\\Model\\Config\\Source\\Store',
  'Magento\\Config\\Model\\Config\\Source\\Website',
  'Magento\\Config\\Model\\Config\\Source\\Nooptreq',
  'Magento\\Config\\Model\\Config\\Source\\Email\\Template',
  'Magento\\Config\\Model\\Config\\Source\\Email\\Identity',
  'Magento\\Config\\Model\\Config\\Source\\Email\\Method',
  'Magento\\Config\\Model\\Config\\Source\\Design\\Robots',
  'Magento\\Cms\\Model\\Config\\Source\\Page',
];

export default class SystemConfigWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<SystemConfigWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();
    builder.setTitle('Generate system configuration');
    builder.setDescription(
      'Declare one or more sections, their groups, and their fields. ' +
        'The Section/Group columns in the Groups and Fields tables refer by ID to the rows above.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('systemConfig');
    tab.setTitle('System Configuration');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the configuration will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.checkbox('generateAcl', 'Generate ACL resource entries')
        .setDescription(['Also produce etc/acl.xml so each section.resource id is declared.'])
        .setInitialValue(true)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.dynamicRow('sections', 'Sections')
        .setDescription(['One row per configuration section'])
        .addFields([
          WizardFieldBuilder.text('id', 'ID').setPlaceholder('my_section').build(),
          WizardFieldBuilder.text('label', 'Label').setPlaceholder('My Section').build(),
          WizardFieldBuilder.number('sortOrder', 'Sort').setInitialValue(10).build(),
          WizardFieldBuilder.text('tab', 'Tab').setInitialValue('general').build(),
          WizardFieldBuilder.text('resource', 'Resource')
            .setPlaceholder('Vendor_Module::config')
            .build(),
        ])
        .build()
    );

    tab.addField(
      WizardFieldBuilder.dynamicRow('groups', 'Groups')
        .setDescription([
          'One row per group. "Section" must match the ID of a row in the Sections table.',
        ])
        .addFields([
          WizardFieldBuilder.autocomplete('sectionRef', 'Section')
            .setPlaceholder('my_section')
            .setSuggestionsFrom({ fieldId: 'sections', column: 'id' })
            .build(),
          WizardFieldBuilder.text('id', 'ID').setPlaceholder('general').build(),
          WizardFieldBuilder.text('label', 'Label').setPlaceholder('General Settings').build(),
          WizardFieldBuilder.number('sortOrder', 'Sort').setInitialValue(10).build(),
        ])
        .build()
    );

    tab.addField(
      WizardFieldBuilder.dynamicRow('fields', 'Fields')
        .setDescription([
          'One row per field. "Section" and "Group" must match IDs from the tables above.',
        ])
        .addFields([
          WizardFieldBuilder.autocomplete('sectionRef', 'Section')
            .setPlaceholder('my_section')
            .setSuggestionsFrom({ fieldId: 'sections', column: 'id' })
            .build(),
          WizardFieldBuilder.autocomplete('groupRef', 'Group')
            .setPlaceholder('general')
            .setSuggestionsFrom({
              fieldId: 'groups',
              column: 'id',
              filterBy: { column: 'sectionRef', fromField: 'sectionRef' },
            })
            .build(),
          WizardFieldBuilder.text('id', 'ID').setPlaceholder('my_field').build(),
          WizardFieldBuilder.text('label', 'Label').setPlaceholder('My Field').build(),
          WizardFieldBuilder.select('type', 'Type')
            .setOptions(FIELD_TYPE_OPTIONS)
            .setInitialValue('text')
            .build(),
          WizardFieldBuilder.number('sortOrder', 'Sort').setInitialValue(10).build(),
          WizardFieldBuilder.text('default', 'Default').setPlaceholder('optional').build(),
          WizardFieldBuilder.autocomplete('sourceModel', 'Source Model')
            .setPlaceholder('Magento\\Config\\Model\\Config\\Source\\Yesno')
            .setSuggestions(COMMON_SOURCE_MODELS)
            .build(),
          WizardFieldBuilder.text('comment', 'Comment').setPlaceholder('optional').build(),
        ])
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');

    return this.openWizard<SystemConfigWizardData>(builder.build());
  }

  public static hasDefaults(data: SystemConfigWizardData): boolean {
    return (data.fields ?? []).some(f => (f.default ?? '').length > 0);
  }
}
