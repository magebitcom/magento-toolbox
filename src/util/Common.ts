import ExtensionState from 'common/ExtensionState';
import { workspace, WorkspaceFolder, window } from 'vscode';

export default class Common {
  public static EXTENSION_ID = 'magebit.magebit-magento-toolbox';

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

  public static getVersion(): string {
    return ExtensionState.context.extension.packageJSON.version;
  }
}
