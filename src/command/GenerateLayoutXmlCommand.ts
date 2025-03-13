import { MagentoScope } from 'types';
import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { WizardField, WizardValidationRule } from 'webview/types';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';

export default class GenerateLayoutXmlCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateLayoutXmlFile');
  }

  getAreas(): MagentoScope[] {
    return [
      MagentoScope.Global,
      MagentoScope.Adminhtml,
      MagentoScope.Frontend,
      MagentoScope.Cron,
      MagentoScope.WebapiRest,
      MagentoScope.WebapiSoap,
      MagentoScope.Graphql,
    ];
  }

  getWizardTitle(): string {
    return 'Layout XML File';
  }

  getTemplatePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    if (data.area && data.area !== MagentoScope.Global) {
      return `app/code/${vendor}/${module}/view/${data.area}/layout/${data.name}.xml`;
    }

    return `app/code/${vendor}/${module}/view/base/layout/${data.name}.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-layout';
  }

  getWizardFields(): WizardField[] {
    return [WizardFieldBuilder.text('name', 'Layout Name').build()];
  }

  getWizardValidation(): Record<string, WizardValidationRule> {
    return {
      name: 'required',
    };
  }
}
