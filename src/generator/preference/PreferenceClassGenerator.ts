import FileHeader from 'common/php/FileHeader';
import GeneratedFile from 'generator/GeneratedFile';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import FileGenerator from 'generator/FileGenerator';
import Magento from 'util/Magento';

export default class PreferenceClassGenerator extends FileGenerator {
  public constructor(protected data: PreferenceWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const namespaceParts = [vendor, module, this.data.directory];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const header = FileHeader.getHeader(this.data.module);

    const phpFile = new PhpFile();
    if (header) {
      phpFile.addComment(header);
    }
    phpFile.setStrictTypes(true);

    const namespace = phpFile.addNamespace(namespaceParts.join('\\'));

    const preferenceClass = namespace.addClass(this.data.className);

    if (this.data.inheritClass && this.data.parentClass) {
      preferenceClass.setExtends(this.data.parentClass);
    }

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, this.data.directory, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
