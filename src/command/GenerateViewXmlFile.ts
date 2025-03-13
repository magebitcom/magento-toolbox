import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import FileHeader from 'common/xml/FileHeader';

export default class GenerateViewXmlFile extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateViewXmlFile');
  }

  getWizardTitle(): string {
    return 'View XML File';
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/view.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-view';
  }
}
