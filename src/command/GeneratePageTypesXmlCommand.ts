import { MagentoScope } from 'types';
import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import FileHeader from 'common/xml/FileHeader';

export default class GeneratePageTypesXmlCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generatePageTypesXmlFile');
  }

  getAreas(): MagentoScope[] {
    return [MagentoScope.Frontend];
  }

  getWizardTitle(): string {
    return 'Page Types XML File';
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/frontend/page_types.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-page-types';
  }
}
