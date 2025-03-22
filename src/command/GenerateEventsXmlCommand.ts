import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { MagentoScope } from 'types/global';
import FileHeader from 'common/xml/FileHeader';

export default class GenerateEventsXmlCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateEventsXml');
  }

  getWizardTitle(): string {
    return 'Events XML File';
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

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    if (data.area && data.area !== MagentoScope.Global) {
      return `app/code/${vendor}/${module}/etc/${data.area}/events.xml`;
    }

    return `app/code/${vendor}/${module}/etc/events.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-events';
  }
}
