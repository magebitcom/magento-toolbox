import { Uri, window, WorkspaceFolder } from 'vscode';
import { Command } from './Command';
import Common from 'util/Common';
import FileGenerator from 'generator/FileGenerator';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import CommandAbortError from './CommandAbortError';

export type OpenStrategy = 'first' | 'last' | 'all' | 'none';

export abstract class AbstractWizardCommand<TData> extends Command {
  protected abstract showWizard(
    contextModule: string | undefined,
    uri: Uri | undefined,
    args: unknown[]
  ): Promise<TData>;

  protected abstract buildGenerators(data: TData): FileGenerator[];

  protected openStrategy(): OpenStrategy {
    return 'first';
  }

  public async execute(uri?: Uri, ...args: unknown[]): Promise<void> {
    const contextModule = this.resolveContextModule(uri);

    let data: TData;
    try {
      data = await this.showWizard(contextModule, uri, args);
    } catch (error) {
      if (error instanceof WizzardClosedError || error instanceof CommandAbortError) {
        return;
      }
      throw error;
    }

    const workspaceFolder = this.requireWorkspaceFolder();
    if (!workspaceFolder) {
      return;
    }

    const manager = new FileGeneratorManager(this.buildGenerators(data));
    await manager.generate(workspaceFolder.uri);
    await manager.writeFiles();
    await manager.refreshIndex(workspaceFolder);
    this.openFiles(manager);
  }

  protected resolveContextModule(uri: Uri | undefined): string | undefined {
    const contextUri = uri ?? window.activeTextEditor?.document.uri;
    if (!contextUri) {
      return undefined;
    }

    const moduleIndex = IndexManager.getIndexData(ModuleIndexer.KEY);
    if (!moduleIndex) {
      return undefined;
    }

    return moduleIndex.getModuleByUri(contextUri)?.name;
  }

  protected requireWorkspaceFolder(): WorkspaceFolder | undefined {
    const folder = Common.getActiveWorkspaceFolder();
    if (!folder) {
      window.showErrorMessage('No active workspace folder');
      return undefined;
    }
    return folder;
  }

  protected openFiles(manager: FileGeneratorManager): void {
    switch (this.openStrategy()) {
      case 'all':
        manager.openAllFiles();
        return;
      case 'last':
        manager.openLastFile();
        return;
      case 'none':
        return;
      case 'first':
      default:
        manager.openFirstFile();
    }
  }
}
