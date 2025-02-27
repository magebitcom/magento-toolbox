import { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import { Uri } from 'vscode';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import TemplateGenerator from 'generator/TemplateGenerator';
import FileHeader from 'common/php/FileHeader';

export default class ModuleRegistrationGenerator extends TemplateGenerator {
  public constructor(protected data: ModuleWizardData | ModuleWizardComposerData) {
    super('registration.php', 'php/registration', data);
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
