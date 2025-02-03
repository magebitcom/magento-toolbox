import GeneratedFile from 'generator/GeneratedFile';
import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import XmlGenerator from 'generator/XmlGenerator';
import { Uri } from 'vscode';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';

export default class ModuleXmlGenerator extends ModuleFileGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const xmlContent = this.getXmlContent();

    const moduleDirectory = this.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri
    );

    const moduleFile = Uri.joinPath(moduleDirectory, 'etc', 'module.xml');

    return new GeneratedFile(moduleFile, xmlContent);
  }

  protected getXmlContent(): string {
    const moduleName = this.data.vendor + '_' + this.data.module;
    const xml = {
      '?xml': {
        '@_version': '1.0',
      },
      config: {
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:noNamespaceSchemaLocation': 'urn:magento:framework:Module/etc/module.xsd',
        module: {
          '@_name': moduleName,
        },
      },
    };

    const xmlGenerator = new XmlGenerator(xml);
    return xmlGenerator.toString();
  }
}
