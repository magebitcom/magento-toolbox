import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ExtensionState from 'common/ExtensionState';

export class Webview {
  protected panel?: vscode.WebviewPanel;

  protected open(
    type: string,
    title: string,
    column: vscode.ViewColumn = vscode.ViewColumn.One,
    options: vscode.WebviewOptions = {},
    filename: string = 'index.html'
  ) {
    this.panel = vscode.window.createWebviewPanel(type, title, column, options);

    this.panel.webview.html = this.getHtml(filename);
  }

  protected getHtml(filename: string) {
    return fs.readFileSync(
      path.join(ExtensionState.context.extensionPath, 'templates', 'webview', filename),
      'utf8'
    );
  }

  protected close() {
    this.panel?.dispose();
  }
}
