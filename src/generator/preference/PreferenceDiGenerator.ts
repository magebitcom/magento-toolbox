import GeneratedFile from 'generator/GeneratedFile';
import FindOrCreateDiXml from 'generator/util/FindOrCreateDiXml';
import GenerateFromTemplate from 'generator/util/GenerateFromTemplate';
import { Uri } from 'vscode';
import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import indentString from 'indent-string';
import Magento from 'util/Magento';
import FileGenerator from 'generator/FileGenerator';

export default class PreferenceDiGenerator extends FileGenerator {
  public constructor(protected data: PreferenceWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const etcDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const diFile = Magento.getUriWithArea(etcDirectory, 'di.xml', this.data.area);
    const diXml = await FindOrCreateDiXml.execute(workspaceUri, vendor, module, this.data.area);
    const insertPosition = this.getInsertPosition(diXml);

    const pluginXml = await GenerateFromTemplate.generate('xml/preference', {
      forClass: this.data.parentClass,
      typeClass: this.data.className,
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
