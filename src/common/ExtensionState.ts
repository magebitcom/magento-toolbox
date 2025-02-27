import { ExtensionContext, WorkspaceFolder } from 'vscode';

export default class ExtensionState {
  private static _context: ExtensionContext;
  private static _magentoWorkspaces: WorkspaceFolder[] = [];

  public static init(context: ExtensionContext, magentoWorkspaces: WorkspaceFolder[]) {
    this._context = context;
    this._magentoWorkspaces = magentoWorkspaces;
  }

  public static get context() {
    return this._context;
  }

  public static get magentoWorkspaces() {
    return this._magentoWorkspaces;
  }
}
