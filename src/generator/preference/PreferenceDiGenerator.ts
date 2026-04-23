import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { TemplatePath } from 'types/handlebars';

export default class PreferenceDiGenerator extends AbstractXmlFragmentGenerator<PreferenceWizardData> {
  protected getTarget(): XmlFileSpec {
    return {
      filename: 'di.xml',
      blankTemplate: TemplatePath.XmlBlankDi,
      area: this.data.area,
    };
  }

  protected async renderFragment(renderer: HandlebarsTemplateRenderer): Promise<string> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const directoryParts = this.data.directory.split('/');
    const typeNamespace = [vendor, module, ...directoryParts, this.data.className].join('\\');

    return renderer.render(TemplatePath.XmlDiPreference, {
      forClass: this.data.parentClass,
      typeClass: typeNamespace,
    });
  }
}
