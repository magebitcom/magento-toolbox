import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import FileGenerator from 'generator/FileGenerator';

export default class ModuleRegistrationGenerator extends FileGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const registrationContent = this.getRegistrationContent();
    const registrationFileUri = Magento.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri,
      'registration.php'
    );
    return new GeneratedFile(registrationFileUri, registrationContent);
  }

  protected getRegistrationContent(): string {
    const printer = new PsrPrinter();
    const file = new PhpFile();
    file.setStrictTypes(true);
    file.addUse('Magento\\Framework\\Component\\ComponentRegistrar');

    const moduleName = Magento.getModuleName(this.data.vendor, this.data.module);

    let content = printer.printFile(file);

    content += `ComponentRegistrar::register(ComponentRegistrar::MODULE, '${moduleName}', __DIR__);\n`;

    return content;
  }
}
