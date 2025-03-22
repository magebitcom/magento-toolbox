import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import FindOrCreateDiXml from 'generator/util/FindOrCreateDiXml';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpMethod } from 'parser/php/PhpMethod';
import { Uri } from 'vscode';
import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import indentString from 'indent-string';
import { PhpInterface } from 'parser/php/PhpInterface';
import Magento from 'util/Magento';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';

export default class PluginDiGenerator extends FileGenerator {
  public constructor(
    protected data: PluginContextWizardData,
    protected subjectClass: PhpClass | PhpInterface,
    protected subjectMethod: PhpMethod
  ) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const etcDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const diFile = Magento.getUriWithArea(etcDirectory, 'di.xml', this.data.scope);
    const subjectNamespace = this.subjectClass.namespace + '\\' + this.subjectClass.name;
    const pluginType = Magento.getModuleNamespace(vendor, module).append(
      'Plugin',
      this.data.className
    );
    const diXml = await FindOrCreateDiXml.execute(workspaceUri, vendor, module, this.data.scope);
    const insertPosition = this.getInsertPosition(diXml);

    const renderer = new HandlebarsTemplateRenderer();

    const pluginXml = await renderer.render('xml/di/plugin', {
      pluginName: this.data.name,
      pluginType: pluginType.toString(),
      sortOrder: this.data.sortOrder,
    });

    const diType = await renderer.render(
      'xml/di/type',
      {
        subjectNamespace,
      },
      {
        typeContent: pluginXml,
      }
    );

    const newDiXml =
      diXml.slice(0, insertPosition) +
      '\n' +
      indentString(diType, 4) +
      '\n' +
      diXml.slice(insertPosition);

    return new GeneratedFile(diFile, newDiXml, false);
  }

  private getInsertPosition(diXml: string): number {
    return diXml.indexOf('</config>');
  }
}
