import GeneratedFile from 'generator/GeneratedFile';
import XmlGenerator from 'generator/XmlGenerator';
import { Uri } from 'vscode';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import FileGenerator from '../FileGenerator';
import Magento from 'util/Magento';

export default class ModuleXmlGenerator extends FileGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const xmlContent = this.getXmlContent();

    const moduleFile = Magento.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri,
      'etc/module.xml'
    );

    return new GeneratedFile(moduleFile, xmlContent);
  }

  protected getXmlContent(): string {
    const moduleName = Magento.getModuleName(this.data.vendor, this.data.module);
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
