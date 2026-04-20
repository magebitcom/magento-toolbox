import { AbstractWizardCommand } from '../AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import GraphqlResolverClassGenerator from 'generator/graphqlResolver/GraphqlResolverClassGenerator';
import GraphqlResolverWizard, { GraphqlResolverWizardData } from 'wizard/GraphqlResolverWizard';

export default class GenerateGraphqlResolverCommand extends AbstractWizardCommand<GraphqlResolverWizardData> {
  constructor() {
    super('magento-toolbox.generateGraphqlResolver');
  }

  protected showWizard(contextModule: string | undefined): Promise<GraphqlResolverWizardData> {
    return this.attachPreview(new GraphqlResolverWizard()).show(contextModule);
  }

  protected buildGenerators(data: GraphqlResolverWizardData): FileGenerator[] {
    return [new GraphqlResolverClassGenerator(data)];
  }
}
