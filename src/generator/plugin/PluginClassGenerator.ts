import FileHeader from 'common/php/FileHeader';
import GeneratedFile from 'generator/GeneratedFile';
import { upperFirst } from 'lodash-es';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';
import { Uri } from 'vscode';
import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import FileGenerator from 'generator/FileGenerator';
import Magento from 'util/Magento';

export default class PluginClassGenerator extends FileGenerator {
  public constructor(
    protected data: PluginContextWizardData,
    protected subjectClass: PhpClass | PhpInterface,
    protected subjectMethod: PhpMethod
  ) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const nameParts = this.data.className.split(/[\\/]+/);
    const pluginName = nameParts.pop() as string;

    const parts = [vendor, module, 'Plugin', ...nameParts];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const pluginMethodName = `${this.data.type}${upperFirst(this.data.method)}`;

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);

    if (header) {
      phpFile.addComment(header);
    }

    const namespace = phpFile.addNamespace(parts.join('\\'));
    const phpClass = namespace.addClass(pluginName);
    const pluginMethod = phpClass.addMethod(pluginMethodName);

    pluginMethod
      .addParameter('subject')
      .setType(this.getFullyQualifiedTypeName(this.subjectClass.name));

    namespace.addUse(this.getFullyQualifiedTypeName(this.subjectClass.name));

    if (this.data.type === 'around') {
      pluginMethod.addParameter('proceed').setType('callable');
    } else if (this.data.type === 'after') {
      pluginMethod.addParameter('result');
    }

    for (const parameter of this.subjectMethod.ast.arguments ?? []) {
      const pluginParameter = pluginMethod.addParameter(
        this.subjectMethod.getIdentifierName(parameter.name)
      );

      pluginParameter.setType(
        parameter.type
          ? this.getFullyQualifiedTypeName(this.subjectMethod.getIdentifierName(parameter.type))
          : undefined
      );

      pluginParameter.setNullable(parameter.nullable);
      pluginParameter.setDefaultValue(
        parameter.value ? ((parameter as any).value.value as string) : undefined
      );
    }

    pluginMethod.setBody('// TODO: Plugin code');

    const printer = new PsrPrinter();
    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, 'Plugin', ...nameParts, `${pluginName}.php`),
      printer.printFile(phpFile)
    );
  }

  private getFullyQualifiedTypeName(type: string): string {
    if (type.startsWith('\\')) {
      return type;
    }

    if (['string', 'int', 'float', 'bool', 'array', 'object'].includes(type)) {
      return type;
    }

    const namespace = this.subjectClass.namespace;
    const typeName = type.startsWith('\\') ? type.slice(1) : type;

    return `${namespace}\\${typeName}`;
  }
}
