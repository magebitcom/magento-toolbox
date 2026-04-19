import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpMethod } from 'parser/php/PhpMethod';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import Magento from 'util/Magento';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import { TemplatePath } from 'types/handlebars';

export default class PluginDiGenerator extends AbstractXmlFragmentGenerator<PluginContextWizardData> {
  public constructor(
    data: PluginContextWizardData,
    protected subjectClass: PhpClass | PhpInterface,
    protected subjectMethod: PhpMethod
  ) {
    super(data);
  }

  protected getTarget(): XmlFileSpec {
    return {
      filename: 'di.xml',
      blankTemplate: TemplatePath.XmlBlankDi,
      area: this.data.scope,
    };
  }

  protected async renderFragment(renderer: HandlebarsTemplateRenderer): Promise<string> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const subjectNamespace = this.subjectClass.namespace + '\\' + this.subjectClass.name;
    const pluginType = Magento.getModuleNamespace(vendor, module).append(
      'Plugin',
      this.data.className
    );

    const pluginXml = await renderer.render(TemplatePath.XmlDiPlugin, {
      pluginName: this.data.name,
      pluginType: pluginType.toString(),
      sortOrder: this.data.sortOrder,
    });

    return renderer.render(
      TemplatePath.XmlDiType,
      { subjectNamespace },
      { typeContent: pluginXml }
    );
  }
}
