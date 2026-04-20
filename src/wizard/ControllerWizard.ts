import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import Validation from 'common/Validation';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardFormBuilder } from 'webview/WizardFormBuilder';
import { WizardTabBuilder } from 'webview/WizardTabBuilder';

export type ControllerArea = 'frontend' | 'adminhtml';
export type ControllerResultType = 'page' | 'json' | 'redirect';
export type ControllerHttpMethod = 'get' | 'post' | 'both' | 'none';

export interface ControllerWizardData {
  module: string;
  area: ControllerArea;
  routeId: string;
  frontName: string;
  controllerPath: string;
  className: string;
  resultType: ControllerResultType;
  httpMethod: ControllerHttpMethod;
  aclResource: string;
}

const AREA_OPTIONS = [
  { label: 'Frontend (storefront)', value: 'frontend' },
  { label: 'Adminhtml (admin backend)', value: 'adminhtml' },
];

const RESULT_TYPE_OPTIONS = [
  { label: 'Page (HTML via PageFactory)', value: 'page' },
  { label: 'JSON (JsonFactory)', value: 'json' },
  { label: 'Redirect', value: 'redirect' },
];

const HTTP_METHOD_OPTIONS = [
  { label: 'GET only', value: 'get' },
  { label: 'POST only', value: 'post' },
  { label: 'GET + POST', value: 'both' },
  { label: 'None (no interface)', value: 'none' },
];

export default class ControllerWizard extends GeneratorWizard {
  public async show(contextModule?: string): Promise<ControllerWizardData> {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      throw new Error('Module index data not found');
    }

    const modules = moduleIndexData.getModuleOptions(module => module.location === 'app');

    const builder = new WizardFormBuilder();
    builder.setTitle('Generate a controller');
    builder.setDescription(
      'Creates a routable action class and registers its route in etc/{area}/routes.xml.'
    );

    const tab = new WizardTabBuilder();
    tab.setId('controller');
    tab.setTitle('Controller');

    tab.addField(
      WizardFieldBuilder.select('module', 'Module')
        .setDescription(['Module where the controller will be generated'])
        .setOptions(modules)
        .setInitialValue(contextModule || modules[0].value)
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('area', 'Area')
        .setDescription(['Storefront (frontend) or admin backend (adminhtml)'])
        .setOptions(AREA_OPTIONS)
        .setInitialValue('frontend')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('routeId', 'Route ID')
        .setDescription(['snake_case route identifier declared under <route id="…">'])
        .setPlaceholder('my_route')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('frontName', 'Front Name')
        .setDescription(['URL path segment — appears between the base URL and the controller path'])
        .setPlaceholder('my-route')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('controllerPath', 'Controller Path')
        .setDescription([
          'Subpath under Controller/ (or Controller/Adminhtml/). Use slashes for nesting.',
        ])
        .setPlaceholder('Index')
        .setInitialValue('Index')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('className', 'Action Class Name')
        .setDescription(['PHP class name for the action'])
        .setPlaceholder('Index')
        .setInitialValue('Index')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('resultType', 'Result Type')
        .setDescription(['What the execute() method returns'])
        .setOptions(RESULT_TYPE_OPTIONS)
        .setInitialValue('page')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.select('httpMethod', 'HTTP Method')
        .setDescription(['Which Http*ActionInterface the class should implement'])
        .setOptions(HTTP_METHOD_OPTIONS)
        .setInitialValue('get')
        .build()
    );

    tab.addField(
      WizardFieldBuilder.text('aclResource', 'ACL Resource')
        .setDescription([
          'ACL resource id for this admin controller (declared separately in etc/acl.xml)',
        ])
        .setPlaceholder('Vendor_Module::items')
        .addDependsOn('area', 'adminhtml')
        .build()
    );

    builder.addTab(tab.build());

    builder.addValidation('module', 'required');
    builder.addValidation('area', 'required');
    builder.addValidation('routeId', ['required', `regex:/${Validation.SNAKE_CASE_REGEX.source}/`]);
    builder.addValidation('frontName', 'required');
    builder.addValidation('controllerPath', ['required', 'regex:/^[A-Z][A-Za-z0-9/]*$/']);
    builder.addValidation('className', [
      'required',
      `regex:/${Validation.CLASS_NAME_REGEX.source}/`,
    ]);
    builder.addValidation('resultType', 'required');
    builder.addValidation('httpMethod', 'required');

    return this.openWizard<ControllerWizardData>(builder.build());
  }
}
