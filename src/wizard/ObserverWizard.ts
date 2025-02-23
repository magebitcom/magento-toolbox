import Validation from 'common/Validation';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { MagentoScope } from 'types';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export interface ObserverWizardData {
  module: string;
  area: MagentoScope;
  eventName: string;
  observerName: string;
  className: string;
  directoryPath: string;
}

export default class ObserverWizard extends GeneratorWizard {
  public async show(
    initialEventName?: string,
    contextModule?: string
  ): Promise<ObserverWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();

    builder.setTitle('Generate a new observer');
    builder.setDescription('Generates a new observer.');

    const tab = new WizardTabBuilder();
    tab.setId('observer');
    tab.setTitle('Observer');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where observer will be generated in'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('area', 'Area')
        .setOptions(Object.values(MagentoScope).map(scope => ({ label: scope, value: scope })))
        .setInitialValue(MagentoScope.Global)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('eventName', 'Event name')
        .setPlaceholder('event_name')
        .setInitialValue(initialEventName)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('observerName', 'Observer name')
        .setPlaceholder('observer_name')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Observer class name')
        .setPlaceholder('ObserverName')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('directoryPath', 'Directory path').setInitialValue('Observer').build()
    );

    builder.addTab(tab.build());

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
