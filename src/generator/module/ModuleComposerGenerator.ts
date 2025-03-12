import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { ModuleWizardComposerData } from 'wizard/ModuleWizard';

export default class ModuleComposerGenerator extends FileGenerator {
  public constructor(protected data: ModuleWizardComposerData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = this.getComposerContent();
    const moduleDirectory = Magento.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri
    );
    const moduleFile = Uri.joinPath(moduleDirectory, 'composer.json');
    return new GeneratedFile(moduleFile, content);
  }

  public getComposerContent(): string {
    const namespace = Magento.getModuleNamespace(this.data.vendor, this.data.module);

    const object: any = {
      name: this.data.composerName,
      description: this.data.composerDescription,
      type: 'magento2-module',
      license: this.data.license.toUpperCase(),
      'minimum-stability': 'dev',
      require: {},
      autoload: {
        files: ['registration.php'],
        psr4: {
          [namespace.toString() + '\\']: '',
        },
      },
    };

    if (this.data.version) {
      object.version = this.data.version;
    }

    return JSON.stringify(object, null, 4);
  }
}
