import * as vscode from 'vscode';
import IndexManager from './IndexManager';

class IndexRunner {
  public async indexWorkspace(force: boolean = false): Promise<void> {
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
          await IndexManager.indexWorkspace(workspaceFolder, progress);
        }
      );
    }
  }

  public async indexFile(workspaceFolder: vscode.WorkspaceFolder, file: vscode.Uri): Promise<void> {
    await IndexManager.indexFile(workspaceFolder, file);
  }

  public async indexFiles(
    workspaceFolder: vscode.WorkspaceFolder,
    files: vscode.Uri[]
  ): Promise<void> {
    await IndexManager.indexFiles(workspaceFolder, files);
  }
}

export default new IndexRunner();
