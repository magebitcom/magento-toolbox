import { Uri, window, workspace, WorkspaceFolder } from 'vscode';
import { Command } from './Command';
import Common from 'util/Common';
import FileGenerator from 'generator/FileGenerator';
import FileGeneratorManager from 'generator/FileGeneratorManager';
import FileSystem from 'util/FileSystem';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import WizzardClosedError from 'webview/error/WizzardClosedError';
import { GeneratorWizard } from 'webview/GeneratorWizard';
import { PreviewResult } from 'types/webview';
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

  /**
   * Attach the live-preview handler to a freshly-constructed wizard. Commands
   * should call this on any wizard before invoking show().
   */
  protected attachPreview<W extends GeneratorWizard>(wizard: W): W {
    wizard.setPreviewHandler(formData => this.buildPreview(formData as TData));
    return wizard;
  }

  /**
   * Dry-run the generators for the given form data and return a list of
   * files that would be created or modified. Catches generator errors (e.g.
   * partial input) and returns an empty list so the webview can show a neutral
   * state until the form is complete enough to generate.
   */
  protected async buildPreview(data: TData): Promise<PreviewResult> {
    const workspaceFolder = Common.getActiveWorkspaceFolder();
    if (!workspaceFolder) {
      return { files: [] };
    }

    try {
      const manager = new FileGeneratorManager(this.buildGenerators(data));
      const generated = await manager.generate(workspaceFolder.uri);

      const files = await Promise.all(
        generated.map(async file => ({
          path: workspace.asRelativePath(file.uri),
          action: ((await FileSystem.fileExists(file.uri)) ? 'modify' : 'create') as
            | 'create'
            | 'modify',
        }))
      );

      return { files };
    } catch (error) {
      return { files: [], error: error instanceof Error ? error.message : String(error) };
    }
  }
}
