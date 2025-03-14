import GeneratedFile from 'generator/GeneratedFile';
import FindOrCreateDiXml from 'generator/util/FindOrCreateDiXml';
import { Uri } from 'vscode';
import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import indentString from 'indent-string';
import Magento from 'util/Magento';
import FileGenerator from 'generator/FileGenerator';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';

export default class PreferenceDiGenerator extends FileGenerator {
  public constructor(protected data: PreferenceWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const directoryParts = this.data.directory.split('/');
    const namespaceParts = [vendor, module, ...directoryParts, this.data.className];
    const typeNamespace = namespaceParts.join('\\');

    const etcDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const diFile = Magento.getUriWithArea(etcDirectory, 'di.xml', this.data.area);
    const diXml = await FindOrCreateDiXml.execute(workspaceUri, vendor, module, this.data.area);
    const insertPosition = this.getInsertPosition(diXml);

    const renderer = new HandlebarsTemplateRenderer();

    const pluginXml = await renderer.render('xml/preference', {
      forClass: this.data.parentClass,
      typeClass: typeNamespace,
    });

    const newDiXml =
      diXml.slice(0, insertPosition) +
      '\n' +
      indentString(pluginXml, 4) +
      '\n' +
      diXml.slice(insertPosition);

    return new GeneratedFile(diFile, newDiXml, false);
  }

  private getInsertPosition(diXml: string): number {
    return diXml.indexOf('</config>');
  }
}
