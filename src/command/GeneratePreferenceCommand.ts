import { Command } from 'command/Command';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import Common from 'util/Common';
import { TextDocument, Uri, window } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import PreferenceWizard, { PreferenceWizardData } from 'wizard/PreferenceWizard';
import PreferenceClassGenerator from 'generator/preference/PreferenceClassGenerator';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PreferenceDiGenerator from 'generator/preference/PreferenceDiGenerator';

export default class GeneratePreferenceCommand extends Command {
  constructor() {
    super('magento-toolbox.generatePreference');
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

    const parentClassName = await this.getParentClassName(window.activeTextEditor?.document);

    const preferenceWizard = new PreferenceWizard();

    let data: PreferenceWizardData;

    try {
      data = await preferenceWizard.show(parentClassName, contextModule);
    } catch (error) {
      if (error instanceof WizzardClosedError) {
        return;
      }

      throw error;
    }

    const manager = new FileGeneratorManager([
      new PreferenceClassGenerator(data),
      new PreferenceDiGenerator(data),
    ]);

    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      window.showErrorMessage('No active workspace folder');
      return;
    }

    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    manager.openAllFiles();
  }

  private async getParentClassName(
    document: TextDocument | undefined
  ): Promise<string | undefined> {
    if (!document) {
      return undefined;
    }

    const phpFile = await PhpDocumentParser.parse(document);
    const info = new ClasslikeInfo(phpFile);

    return info.getNamespace();
  }
}
