import IndexManager from 'indexer/IndexManager';
import { Command } from './Command';
import { Uri, WorkspaceFolder } from 'vscode';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import TemplateGenerator from 'generator/TemplateGenerator';
import Common from 'util/Common';
import SimpleTemplateWizard, { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { MagentoScope } from 'types/global';
import { WizardField, WizardValidationRule } from 'types/webview';

export abstract class SimpleTemplateGeneratorCommand extends Command {
  abstract getWizardTitle(): string;

  public getAreas(): MagentoScope[] {
    return [];
  }

  abstract getFilePath(data: TemplateWizardData): string;

  abstract getTemplateName(data: TemplateWizardData): string;

  public getFileHeader(data: TemplateWizardData): string | undefined {
    return undefined;
  }

  public getWizardFields(): WizardField[] {
    return [];
  }

  public getWizardValidation(): Record<string, WizardValidationRule> {
    return {};
  }

  public getTemplateData(data: TemplateWizardData): Record<string, string> {
    return data;
  }

  public async getWizardData(contextModule: string | undefined): Promise<TemplateWizardData> {
    const wizard = new SimpleTemplateWizard();
    const data = await wizard.show(
      this.getWizardTitle(),
      contextModule,
      this.getAreas(),
      this.getWizardFields(),
      this.getWizardValidation()
    );

    return data;
  }

  public getContextModule(contextUri: Uri | undefined): string | undefined {
    if (!contextUri) {
      return undefined;
    }

    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (moduleIndex && contextUri) {
      const module = moduleIndex.getModuleByUri(contextUri);

      if (module) {
        return module.name;
      }
    }

    return undefined;
  }

  protected getWorkspaceFolder(): WorkspaceFolder {
    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      throw new Error('No active workspace folder');
    }

    return workspaceFolder;
  }

  public async execute(uri?: Uri): Promise<void> {
    const contextModule = this.getContextModule(uri);
    const data = await this.getWizardData(contextModule);

    const manager = new FileGeneratorManager([
      new TemplateGenerator(this.getFilePath(data), this.getTemplateName(data), {
        ...this.getTemplateData(data),
        fileHeader: this.getFileHeader(data) ?? '',
      }),
    ]);

    const workspaceFolder = this.getWorkspaceFolder();

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    manager.openFirstFile();
  }
}
