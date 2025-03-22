import GeneratedFile from 'generator/GeneratedFile';
import TemplateGenerator from 'generator/TemplateGenerator';
import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import { TemplatePath } from 'types/handlebars';

export default class ModuleLicenseGenerator extends TemplateGenerator<
  | TemplatePath.LicenseMit
  | TemplatePath.LicenseGplv3
  | TemplatePath.LicenseApache20
  | TemplatePath.LicenseOslv3
> {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    const params = {
      ...data,
      year: new Date().getFullYear(),
    };

    super('LICENSE.txt', TemplatePath.LicenseMit, params);
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
