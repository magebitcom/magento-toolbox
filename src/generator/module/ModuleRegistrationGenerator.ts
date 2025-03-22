import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import { Uri } from 'vscode';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import TemplateGenerator from 'generator/TemplateGenerator';
import FileHeader from 'common/php/FileHeader';
import { TemplatePath } from 'types/handlebars';

export default class ModuleRegistrationGenerator extends TemplateGenerator<TemplatePath.PhpRegistration> {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super('registration.php', TemplatePath.PhpRegistration, data);
  }

  public getTemplateData(): any {
    const data = super.getTemplateData();

    data.fileHeader = FileHeader.getHeaderAsComment(`${this.data.vendor}_${this.data.module}`);

    return data;
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
