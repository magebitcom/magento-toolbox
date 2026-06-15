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
  public constructor(data: ModuleWizardData | ModuleWizardComposerData) {
    super('LICENSE.txt', TemplatePath.LicenseMit, {
      ...data,
      year: new Date().getFullYear(),
    });
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const data = this.data as ModuleWizardData | ModuleWizardComposerData;
    const moduleDirectory = Magento.getModuleDirectory(data.vendor, data.module, workspaceUri);

    return super.generate(moduleDirectory);
  }
}
