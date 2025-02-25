import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import GenerateFromTemplate from 'generator/util/GenerateFromTemplate';
import { Uri } from 'vscode';
import { ObserverWizardData } from 'wizard/ObserverWizard';
import indentString from 'indent-string';
import PhpNamespace from 'common/PhpNamespace';
import FindOrCreateEventsXml from 'generator/util/FindOrCreateEventsXml';
import Magento from 'util/Magento';

export default class ObserverDiGenerator extends FileGenerator {
  public constructor(protected data: ObserverWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const etcDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const observerNamespace = PhpNamespace.fromParts([vendor, module, this.data.directoryPath]);
    const eventsFile = Magento.getUriWithArea(etcDirectory, 'events.xml', this.data.area);
    const eventsXml = await FindOrCreateEventsXml.execute(
      workspaceUri,
      vendor,
      module,
      this.data.area
    );
    const insertPosition = this.getInsertPosition(eventsXml);

    const observerXml = await GenerateFromTemplate.generate('xml/observer', {
      name: this.data.observerName,
      className: observerNamespace.append(this.data.className).toString(),
      eventName: this.data.eventName,
    });

    const newEventsXml =
      eventsXml.slice(0, insertPosition) +
      '\n' +
      indentString(observerXml, 4) +
      '\n' +
      eventsXml.slice(insertPosition);

    return new GeneratedFile(eventsFile, newEventsXml, false);
  }

  private getInsertPosition(diXml: string): number {
    return diXml.indexOf('</config>');
  }
}
