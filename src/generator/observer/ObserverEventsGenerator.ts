import GeneratedFile from 'generator/GeneratedFile';
import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import GenerateFromTemplate from 'generator/util/GenerateFromTemplate';
import { Uri } from 'vscode';
import { ObserverWizardData } from 'wizard/ObserverWizard';
import indentString from 'indent-string';
import PhpNamespace from 'common/PhpNamespace';
import FindOrCreateEventsXml from 'generator/util/FindOrCreateEventsXml';
import { MagentoScope } from 'types';

export default class ObserverDiGenerator extends ModuleFileGenerator {
  public constructor(protected data: ObserverWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const moduleDirectory = this.getModuleDirectory(vendor, module, workspaceUri);
    const observerNamespace = PhpNamespace.fromParts([vendor, module, this.data.directoryPath]);
    const areaPath = this.data.area === MagentoScope.Global ? '' : this.data.area;

    const eventsFile = Uri.joinPath(moduleDirectory, 'etc', areaPath, 'events.xml');
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
