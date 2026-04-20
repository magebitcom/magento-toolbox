import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import { Literal, PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { GraphqlResolverWizardData } from 'wizard/GraphqlResolverWizard';

export default class GraphqlResolverClassGenerator extends FileGenerator {
  private static readonly RESOLVER_INTERFACE =
    'Magento\\Framework\\GraphQl\\Query\\ResolverInterface';
  private static readonly FIELD_CLASS = 'Magento\\Framework\\GraphQl\\Config\\Element\\Field';
  private static readonly RESOLVE_INFO = 'Magento\\Framework\\GraphQl\\Schema\\Type\\ResolveInfo';

  public constructor(protected data: GraphqlResolverWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const pathParts = this.data.directoryPath.split('/').filter(p => p.length > 0);
    const namespace = PhpNamespace.fromParts([vendor, module, ...pathParts]);
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);
    if (header) {
      phpFile.addComment(header);
    }

    const ns = phpFile.addNamespace(namespace.toString());
    ns.addUse(GraphqlResolverClassGenerator.FIELD_CLASS);
    ns.addUse(GraphqlResolverClassGenerator.RESOLVER_INTERFACE);
    ns.addUse(GraphqlResolverClassGenerator.RESOLVE_INFO);

    const resolverClass = ns.addClass(this.data.className);
    resolverClass.addImplement(GraphqlResolverClassGenerator.RESOLVER_INTERFACE);

    if (this.data.description && this.data.description.length > 0) {
      resolverClass.addComment(this.data.description);
    }

    const resolve = resolverClass.addMethod('resolve');
    resolve.addComment('@inheritdoc');
    resolve.addParameter('field').setType(GraphqlResolverClassGenerator.FIELD_CLASS);
    resolve.addParameter('context');
    resolve.addParameter('info').setType(GraphqlResolverClassGenerator.RESOLVE_INFO);
    // node-php-generator's typed API doesn't accept `null` as a default; feed
    // a Literal instance which the dumper renders verbatim as `null`.
    const nullLiteral = new Literal('null');
    resolve
      .addParameter('value')
      .setType('array')
      .setNullable(true)
      .setDefaultValue(nullLiteral as never);
    resolve
      .addParameter('args')
      .setType('array')
      .setNullable(true)
      .setDefaultValue(nullLiteral as never);
    resolve.setBody('// TODO: Implement resolve() method.\n\nreturn null;');

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, ...pathParts, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
