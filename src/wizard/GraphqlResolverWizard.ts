import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface GraphqlResolverWizardData {
  module: string;
  className: string;
  directoryPath: string;
  description: string;
}

export default class GraphqlResolverWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<GraphqlResolverWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();
    builder.setTitle('Generate a GraphQL resolver');
    builder.setDescription(
      'Creates a PHP class implementing Magento\\Framework\\GraphQl\\Query\\ResolverInterface. ' +
        'You still need to wire the class into etc/schema.graphqls via an @resolver directive.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('graphqlResolver');
    tab.setTitle('Resolver');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the resolver will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Class Name')
        .setDescription(['PHP class name for the resolver'])
        .setPlaceholder('RootCategoryId')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('directoryPath', 'Directory')
        .setDescription(['Path under the module root. Usually Model/Resolver or a subfolder.'])
        .setInitialValue('Model/Resolver')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('description', 'Description')
        .setDescription(['Class-level docblock — explains what the resolver returns'])
        .setPlaceholder('Resolves …')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('directoryPath', ['required', 'regex:/^[A-Z][A-Za-z0-9/]*$/']);

    return this.openWizard<GraphqlResolverWizardData>(builder.build());
  }
}
