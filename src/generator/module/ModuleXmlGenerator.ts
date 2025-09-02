import GeneratedFile from 'generator/GeneratedFile';
import XmlGenerator from 'generator/XmlGenerator';
import { Uri } from 'vscode';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import FileGenerator from '../FileGenerator';
import Magento from 'util/Magento';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import { TemplatePath } from 'types/handlebars';

export default class ModuleXmlGenerator extends FileGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const xmlContent = await this.getXmlContent();

    const moduleFile = Magento.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri,
      'etc/module.xml'
    );

    return new GeneratedFile(moduleFile, xmlContent);
  }

  protected async getXmlContent(): Promise<string> {
    const renderer = new HandlebarsTemplateRenderer();
    const moduleName = Magento.getModuleName(this.data.vendor, this.data.module);

    const moduleConfigXml = await renderer.render(TemplatePath.XmlModuleConfig, {
      moduleName,
      sequence: this.data.sequence,
    });

    return moduleConfigXml;
  }
}
