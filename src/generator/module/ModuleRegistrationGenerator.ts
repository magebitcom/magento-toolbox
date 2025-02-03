import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import { Literal, PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import GeneratedFile from 'generator/GeneratedFile';

export default class ModuleRegistrationGenerator extends ModuleFileGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const registrationContent = this.getRegistrationContent();
    const moduleDirectory = this.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri
    );
    const registrationFileUri = Uri.joinPath(moduleDirectory, 'registration.php');
    return new GeneratedFile(registrationFileUri, registrationContent);
  }

  protected getRegistrationContent(): string {
    const printer = new PsrPrinter();
    const file = new PhpFile();
    file.setStrictTypes(true);
    file.addUse('Magento\\Framework\\Component\\ComponentRegistrar');

    const moduleName = this.getModuleName(this.data.vendor, this.data.module);

    let content = printer.printFile(file);

    content += `ComponentRegistrar::register(ComponentRegistrar::MODULE, '${moduleName}', __DIR__);\n`;

    return content;
  }
}
