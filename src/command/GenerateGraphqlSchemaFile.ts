import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';

export default class GenerateGraphqlSchemaFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateGraphqlSchemaFile');
  }

  getWizardTitle(): string {
    return 'GraphQL Schema File';
  }

  getTemplatePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/schema.graphqls`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'graphql/blank-schema';
  }
}
