import Validation from 'common/Validation';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { MagentoScope } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';

export interface ObserverWizardData {
  module: string;
  area: MagentoScope;
  eventName: string;
  observerName: string;
  className: string;
  directoryPath: string;
}

export default class ObserverWizard extends GeneratorWizard {
  public async show(initialEventName?: string): Promise<ObserverWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new observer');
    builder.setDescription('Generates a new observer.');

    builder.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where observer will be generated in'])
        .setOptions(modules)
        .setInitialValue(modules[0].value)
        .build()
    );

    builder.addField(
      WizardFieldBuilder.select('area', 'Area')
        .setOptions(Object.values(MagentoScope).map(scope => ({ label: scope, value: scope })))
        .setInitialValue(MagentoScope.Global)
        .build()
    );

    builder.addField(
      WizardFieldBuilder.text('eventName', 'Event name')
        .setPlaceholder('event_name')
        .setInitialValue(initialEventName)
        .build()
    );
    builder.addField(
      WizardFieldBuilder.text('observerName', 'Observer name')
        .setPlaceholder('observer_name')
        .build()
    );

    builder.addField(
      WizardFieldBuilder.text('className', 'Observer class name')
        .setPlaceholder('ObserverName')
        .build()
    );

    builder.addField(
      WizardFieldBuilder.text('directoryPath', 'Directory path').setInitialValue('Observer').build()
    );

    builder.addValidation('module', 'required');
    builder.addValidation('area', 'required');
    builder.addValidation('eventName', [
      'required',
      `regex:/${Validation.SNAKE_CASE_REGEX.source}/`,
    ]);
    builder.addValidation('observerName', ['required']);
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('directoryPath', 'required');

    const data = await this.openWizard<ObserverWizardData>(builder.build());

    return data;
  }
}
