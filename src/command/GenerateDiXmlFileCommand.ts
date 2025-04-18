import { MagentoScope } from 'types/global';
import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { TemplatePath } from 'types/handlebars';

export default class GenerateDiXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateDiXmlFile');
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
    return 'DI XML File';
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    if (data.area && data.area !== MagentoScope.Global) {
      return `app/code/${vendor}/${module}/etc/${data.area}/di.xml`;
    }

    return `app/code/${vendor}/${module}/etc/di.xml`;
  }

  getTemplateName(data: TemplateWizardData): TemplatePath {
    return TemplatePath.XmlBlankDi;
  }
}
