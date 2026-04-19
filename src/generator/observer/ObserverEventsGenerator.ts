import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import { ObserverWizardData } from 'wizard/ObserverWizard';
import PhpNamespace from 'common/PhpNamespace';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { TemplatePath } from 'types/handlebars';

export default class ObserverEventsGenerator extends AbstractXmlFragmentGenerator<ObserverWizardData> {
  protected getTarget(): XmlFileSpec {
    return {
      filename: 'events.xml',
      blankTemplate: TemplatePath.XmlBlankEvents,
      area: this.data.area,
    };
  }

  protected async renderFragment(renderer: HandlebarsTemplateRenderer): Promise<string> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const observerNamespace = PhpNamespace.fromParts([vendor, module, this.data.directoryPath]);

    const observerXml = await renderer.render(TemplatePath.XmlEventsObserver, {
      name: this.data.observerName,
      className: observerNamespace.append(this.data.className).toString(),
    });

    return renderer.render(
      TemplatePath.XmlEventsEvent,
      { eventName: this.data.eventName },
      { eventContent: observerXml }
    );
  }
}
