import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';

export default class GenerateAclXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateAclXmlFile');
  }

  getWizardTitle(): string {
    return 'ACL XML File';
  }

  getTemplatePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/acl.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-acl';
  }
}
