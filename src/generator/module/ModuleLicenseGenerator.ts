import GeneratedFile from 'generator/GeneratedFile';
import TemplateGenerator from 'generator/TemplateGenerator';
import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';

export default class ModuleLicenseGenerator extends TemplateGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super('LICENSE.txt', `license/${data.license}`, data);
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const moduleDirectory = Magento.getModuleDirectory(
      this.data.vendor,
      this.data.module,
      workspaceUri
    );

    return super.generate(moduleDirectory);
  }
}
