import ExtensionState from 'common/ExtensionState';
import { workspace, WorkspaceFolder, window } from 'vscode';

export default class Common {
  private static isDev = process.env.NODE_ENV !== 'production';

  public static startStopwatch(name: string) {
    if (!this.isDev) {
      return;
    }

    console.time(name);
  }

  public static stopStopwatch(name: string) {
    if (!this.isDev) {
      return;
    }

    console.timeEnd(name);
  }

  public static log(...message: string[]) {
    if (!this.isDev) {
      return;
    }

    console.log(...message);
  }

  public static getActiveWorkspaceFolder(): WorkspaceFolder | undefined {
    if (!workspace.workspaceFolders) {
      throw new Error('Workspace is empty');
    }

    if (window.activeTextEditor?.document.uri) {
      return workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);
    }

    if (ExtensionState.magentoWorkspaces.length > 0) {
      return ExtensionState.magentoWorkspaces[0];
    }

    return undefined;
  }
}
