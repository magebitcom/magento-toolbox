import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export default class DynamicRowWizard extends GeneratorWizard {
  public async show(): Promise<void> {
    const builder = new WizardFormBuilder();

    builder.setTitle('Dynamic Row Example');
    builder.setDescription('Example of a dynamic row.');

    const tab = new WizardTabBuilder();
    tab.setId('dynamic-row');
    tab.setTitle('Dynamic Row');

    tab.addField(
      WizardFieldBuilder.dynamicRow('dynamic-row', 'Dynamic Row')
        .addFields([
          WizardFieldBuilder.text('text', 'Text').build(),
          WizardFieldBuilder.number('number', 'Number').build(),
        ])
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('dynamic-row.*.text', 'required');
    builder.addValidation('dynamic-row.*.number', 'required');
    builder.addValidation('dynamic-row', 'required');
    builder.addValidationMessage('required', 'This field is required');

    const data = await this.openWizard<void>(builder.build());

    return data;
  }
}
