import FileHeader from 'common/php/FileHeader';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { BlockWizardData } from 'wizard/BlockWizard';

export default class BlockClassGenerator extends FileGenerator {
  private static readonly BLOCK_CLASS_PARENT = 'Magento\\Framework\\View\\Element\\Template';

  public constructor(protected data: BlockWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const pathParts = this.data.path.split('/');
    const namespaceParts = [vendor, module, ...pathParts];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const header = FileHeader.getHeader(this.data.module);

    const phpFile = new PhpFile();
    if (header) {
      phpFile.addComment(header);
    }
    phpFile.setStrictTypes(true);

    const namespace = phpFile.addNamespace(namespaceParts.join('\\'));
    namespace.addUse(BlockClassGenerator.BLOCK_CLASS_PARENT);

    const blockClass = namespace.addClass(this.data.name);

    blockClass.setExtends(BlockClassGenerator.BLOCK_CLASS_PARENT);

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, this.data.path, `${this.data.name}.php`),
      printer.printFile(phpFile)
    );
  }
}
