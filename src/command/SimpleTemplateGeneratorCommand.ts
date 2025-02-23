import IndexManager from 'indexer/IndexManager';
import { Command } from './Command';
import { Uri, window } from 'vscode';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import TemplateGenerator from 'generator/TemplateGenerator';
import Common from 'util/Common';
import SimpleTemplateWizard, { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { MagentoScope } from 'types';
import { WizardField, WizardValidationRule } from 'webview/types';

export abstract class SimpleTemplateGeneratorCommand extends Command {
  abstract getWizardTitle(): string;

  public getAreas(): MagentoScope[] {
    return [];
  }

  abstract getTemplatePath(data: TemplateWizardData): string;

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

  public async execute(uri?: Uri): Promise<void> {
    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);
    let contextModule: string | undefined;

    const contextUri = uri || window.activeTextEditor?.document.uri;

    if (moduleIndex && contextUri) {
      const module = moduleIndex.getModuleByUri(contextUri);

      if (module) {
        contextModule = module.name;
      }
    }

    const wizard = new SimpleTemplateWizard();
    const data = await wizard.show(
      this.getWizardTitle(),
      contextModule,
      this.getAreas(),
      this.getWizardFields(),
      this.getWizardValidation()
    );

    const manager = new FileGeneratorManager([
      new TemplateGenerator(this.getTemplatePath(data), this.getTemplateName(data), {
        ...this.getTemplateData(data),
        fileHeader: this.getFileHeader(data) ?? '',
      }),
    ]);

    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      window.showErrorMessage('No active workspace folder');
      return;
    }

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    manager.openFirstFile();
  }
}
