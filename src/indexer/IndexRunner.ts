import * as vscode from 'vscode';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import DiIndexer from './DiIndexer';
import IndexManager from './IndexManager';
import ModuleIndexer from './ModuleIndexer';
import IndexStorage from 'common/IndexStorage';

class IndexRunner {
  public indexManager: IndexManager;

  public constructor() {
    this.indexManager = new IndexManager([
      new ModuleIndexer(),
      new AutoloadNamespaceIndexer(),
      new DiIndexer(),
    ]);
  }

  public async indexWorkspace(force: boolean = false): Promise<void> {
    if (force) {
      IndexStorage.clear();
    } else {
      await IndexStorage.load();
    }

    if (!vscode.workspace.workspaceFolders) {
      return;
    }

    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: '[Magento Toolbox]',
        },
        async progress => {
          await this.indexManager.indexWorkspace(workspaceFolder, progress);
        }
      );
    }

    await IndexStorage.save();
  }

  public async indexFile(workspaceFolder: vscode.WorkspaceFolder, file: vscode.Uri): Promise<void> {
    await this.indexManager.indexFile(workspaceFolder, file);
  }

  public async indexFiles(
    workspaceFolder: vscode.WorkspaceFolder,
    files: vscode.Uri[]
  ): Promise<void> {
    await this.indexManager.indexFiles(workspaceFolder, files);
  }
}

export default new IndexRunner();
