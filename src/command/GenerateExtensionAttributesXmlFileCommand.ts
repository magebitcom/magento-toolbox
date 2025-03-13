import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import FileHeader from 'common/xml/FileHeader';

export default class GenerateExtensionAttributesXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateExtensionAttributesXmlFile');
  }

  getWizardTitle(): string {
    return 'Extension Attributes XML File';
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/extension_attributes.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-extension-attributes';
  }
}
