import { SimpleTemplateGeneratorCommand } from './SimpleTemplateGeneratorCommand';
import { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { MagentoScope } from 'types';
import FileHeader from 'common/xml/FileHeader';
import { WizardFieldBuilder } from 'webview/WizardFieldBuilder';
import { WizardField, WizardValidationRule } from 'webview/types';

export default class GenerateRoutesXmlFileCommand extends SimpleTemplateGeneratorCommand {
  constructor() {
    super('magento-toolbox.generateRoutesXmlFile');
  }

  getWizardTitle(): string {
    return 'Routes XML File';
  }

  getAreas(): MagentoScope[] {
    return [MagentoScope.Adminhtml, MagentoScope.Frontend];
  }

  getFileHeader(data: TemplateWizardData): string | undefined {
    return FileHeader.getHeader(data.module);
  }

  getTemplatePath(data: TemplateWizardData): string {
    const [vendor, module] = data.module.split('_');

    return `app/code/${vendor}/${module}/etc/${data.area}/routes.xml`;
  }

  getTemplateName(data: TemplateWizardData): string {
    return 'xml/blank-routes';
  }

  getWizardFields(): WizardField[] {
    return [
      WizardFieldBuilder.select('frontendRouterId', 'Router ID')
        .setOptions([
          {
            label: 'Default',
            value: 'default',
          },
          {
            label: 'Robots',
            value: 'robots',
          },
          {
            label: 'URL Rewrite',
            value: 'urlrewrite',
          },
          {
            label: 'Standard',
            value: 'standard',
          },
          {
            label: 'CMS',
            value: 'cms',
          },
        ])
        .setInitialValue('default')
        .addDependsOn('area', MagentoScope.Frontend)
        .build(),

      WizardFieldBuilder.select('adminRouterId', 'Router ID')
        .setOptions([
          {
            label: 'Admin',
            value: 'admin',
          },
        ])
        .addDependsOn('area', MagentoScope.Adminhtml)
        .setInitialValue('admin')
        .build(),
      WizardFieldBuilder.text('routeId', 'Route ID').build(),
      WizardFieldBuilder.text('frontName', 'Front Name').build(),
    ];
  }

  getWizardValidation(): Record<string, WizardValidationRule> {
    return {
      adminRouterId: [{ required_if: ['area', MagentoScope.Adminhtml] }],
      frontendRouterId: [{ required_if: ['area', MagentoScope.Frontend] }],
      routeId: 'required',
      frontName: 'required',
    };
  }

  getTemplateData(data: TemplateWizardData): Record<string, string> {
    return {
      ...data,
      routerId: data.frontendRouterId || data.adminRouterId || 'default',
    };
  }
}
