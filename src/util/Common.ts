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

    if (workspace.workspaceFolders.length === 1) {
      return workspace.workspaceFolders[0];
    }

    if (!window.activeTextEditor?.document.uri) {
      throw new Error('No active text editor');
    }

    return workspace.getWorkspaceFolder(window.activeTextEditor.document.uri);
  }
}
