import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import FileHeader from 'common/xml/FileHeader';

export default class GenerateConfigXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateConfigXmlFile');
  }

  getWizardTitle(): string {
    return 'Config XML File';
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/config.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-config';
  }
}
