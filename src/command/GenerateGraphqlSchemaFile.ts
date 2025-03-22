import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { TemplatePath } from 'types/handlebars';

export default class GenerateGraphqlSchemaFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateGraphqlSchemaFile');
  }

  getWizardTitle(): string {
    return 'GraphQL Schema File';
  }

  getFilePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/schema.graphqls`;
  }

  getTemplateName(data: TemplateWizardData): TemplatePath {
    return TemplatePath.GraphqlBlankSchema;
  }
}
