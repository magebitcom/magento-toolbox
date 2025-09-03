import * as vscode from 'vscode';
import IndexManager from './IndexManager';
import ExtensionState from 'common/ExtensionState';
import Common from 'util/Common';

class IndexRunner {
  public async indexWorkspace(force: boolean = false): Promise<void> {
    if (ExtensionState.magentoWorkspaces.length === 0) {
      return;
    }

    for (const workspaceFolder of ExtensionState.magentoWorkspaces) {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: `Magento Toolbox v${Common.getVersion()}`,
        },
        async progress => {
          await IndexManager.indexWorkspace(workspaceFolder, progress, force);
          IndexManager.watchFiles(workspaceFolder);
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
