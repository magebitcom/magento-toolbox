import GeneratedFile from 'generator/GeneratedFile';
import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import FindOrCreateDiXml from 'generator/util/FindOrCreateDiXml';
import GenerateFromTemplate from 'generator/util/GenerateFromTemplate';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpMethod } from 'parser/php/PhpMethod';
import { Uri } from 'vscode';
import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import indentString from 'indent-string';

export default class PluginDiGenerator extends ModuleFileGenerator {
  public constructor(
    protected data: PluginContextWizardData,
    protected subjectClass: PhpClass,
    protected subjectMethod: PhpMethod
  ) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const moduleDirectory = this.getModuleDirectory(vendor, module, workspaceUri);
    const subjectNamespace = this.subjectClass.namespace + '\\' + this.subjectClass.name;
    const pluginType = this.getModuleNamespace(vendor, module) + '\\Plugin\\' + this.data.className;
    const diFile = Uri.joinPath(moduleDirectory, 'etc', 'di.xml');
    const diXml = await FindOrCreateDiXml.execute(workspaceUri, vendor, module);
    const insertPosition = this.getInsertPosition(diXml);

    const pluginXml = await GenerateFromTemplate.generate('xml/plugin', {
      pluginName: this.data.name,
      pluginType,
      sortOrder: this.data.sortOrder,
      subjectNamespace,
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
