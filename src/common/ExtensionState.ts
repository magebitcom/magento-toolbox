import { ExtensionContext } from 'vscode';

export default class ExtensionState {
  private static _context: ExtensionContext;

  public static init(context: ExtensionContext) {
    this._context = context;
  }

  public static get context() {
    return this._context;
  }
}
