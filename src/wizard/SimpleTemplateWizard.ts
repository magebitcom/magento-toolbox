import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { MagentoScope } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';
import slugify from 'slugify';
import { WizardField, WizardValidationRule } from 'webview/types';

export type TemplateWizardData = {
  module: string;
  area?: MagentoScope;
} & Record<string, string>;

export default class SimpleTemplateWizard extends GeneratorWizard {
  public async show(
    title: string,
    initialModule?: string,
    areas: MagentoScope[] = [],
    wizardFields: WizardField[] = [],
    wizardValidation: Record<string, WizardValidationRule> = {}
  ): Promise<TemplateWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    const nameSlug = slugify(title);

    builder.setTitle('Generate a new ' + title);

    const tab = new WizardTabBuilder();
    tab.setId(nameSlug);
    tab.setTitle(title);

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where ' + title + ' will be generated in'])
        .setOptions(modules)
        .setInitialValue(initialModule || modules[0]?.value)
        .build()
    );
    builder.addValidation('module', 'required');

    if (areas.length > 0) {
      tab.addField(
        WizardFieldBuilder.select('area', 'Area')
          .setOptions(areas.map(scope => ({ label: scope, value: scope })))
          .setInitialValue(areas[0])
          .build()
      );

      builder.addValidation('area', 'required');
    }

    wizardFields.forEach(field => {
      tab.addField(field);
    });

    Object.entries(wizardValidation).forEach(([field, validation]) => {
      builder.addValidation(field, validation);
    });

    builder.addTab(tab.build());

    const data = await this.openWizard<TemplateWizardData>(builder.build());

    return data;
  }
}
