import GeneratedFile from 'generator/GeneratedFile';
import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import { Uri } from 'vscode';
import { ModuleWizardComposerData } from 'wizard/ModuleWizard';

export default class ModuleComposerGenerator extends ModuleFileGenerator {
  public constructor(protected data: ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = this.getComposerContent();
    const moduleDirectory = this.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri
    );
    const moduleFile = Uri.joinPath(moduleDirectory, 'composer.json');
    return new GeneratedFile(moduleFile, content);
  }

  public getComposerContent(): string {
    const object: any = {
      name: this.data.composerName,
      description: this.data.composerDescription,
      type: 'magento2-module',
      license: this.data.license,
      'minimum-stability': 'dev',
      require: {},
      autoload: {
        files: ['registration.php'],
        psr4: {
          [`${this.data.vendor}\\${this.data.module}\\`]: '',
        },
      },
    };

    if (this.data.version) {
      object.version = this.data.version;
    }

    return JSON.stringify(object, null, 4);
  }
}
