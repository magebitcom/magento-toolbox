import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import FileHeader from 'common/xml/FileHeader';
import { TemplatePath } from 'types/handlebars';

export default class GenerateWidgetXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateWidgetXmlFile');
  }

  getWizardTitle(): string {
    return 'Widget XML File';
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/widget.xml`;
  }

  getTemplateName(data: TemplateWizardData): TemplatePath {
    return TemplatePath.XmlBlankWidget;
  }
}
