import FileHeader from 'common/php/FileHeader';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { ViewModelWizardData } from 'wizard/ViewModelWizard';

export default class ViewModelClassGenerator extends FileGenerator {
  private static readonly ARGUMENT_INTERFACE =
    'Magento\\Framework\\View\\Element\\Block\\ArgumentInterface';

  public constructor(protected data: ViewModelWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const pathParts = this.data.directory.split('/');
    const namespaceParts = [vendor, module, ...pathParts];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const header = FileHeader.getHeader(this.data.module);

    const phpFile = new PhpFile();
    if (header) {
      phpFile.addComment(header);
    }
    phpFile.setStrictTypes(true);

    const namespace = phpFile.addNamespace(namespaceParts.join('\\'));
    namespace.addUse(ViewModelClassGenerator.ARGUMENT_INTERFACE);

    const viewModelClass = namespace.addClass(this.data.className);

    viewModelClass.setImplements([ViewModelClassGenerator.ARGUMENT_INTERFACE]);

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, this.data.directory, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
