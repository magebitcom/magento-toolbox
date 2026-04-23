import { Webview } from './Webview';
import * as vscode from 'vscode';
import * as path from 'path';
import { Command, Message, PreviewResult, Wizard } from 'types/webview';
import ExtensionState from 'common/ExtensionState';
import WizzardClosedError from './error/WizzardClosedError';
import { pickGenerator } from 'util/GeneratorPicker';

export type PreviewHandler = (formData: unknown) => Promise<PreviewResult>;

export class GeneratorWizard extends Webview {
  protected previewHandler?: PreviewHandler;

  public setPreviewHandler(handler: PreviewHandler): this {
    this.previewHandler = handler;
    return this;
  }

  protected async openWizard<D>(pageData: Wizard): Promise<D> {
    let it: NodeJS.Timeout;
    let loaded = false;
    let completed = false;

    return new Promise((resolve, reject) => {
      const extensionUri = vscode.Uri.file(ExtensionState.context.extensionPath);

      this.open(
        'magento-toolbox.generatorWizard',
        'Magento Toolbox: Generator Wizard',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [extensionUri],
        }
      );

      const assets = {
        logoUri:
          this.panel?.webview
            .asWebviewUri(vscode.Uri.joinPath(extensionUri, 'resources', 'logo.jpg'))
            .toString() ?? '',
      };

      this.panel?.webview.onDidReceiveMessage(async (message: Message) => {
        if (message.command === Command.Ready) {
          loaded = true;
          clearInterval(it);
          this.panel?.webview.postMessage({
            command: Command.ShowWizard,
            data: pageData,
            assets,
          });
        }

        if (message.command === Command.Submit) {
          completed = true;
          this.panel?.dispose();
          resolve(message.data);
        }

        if (message.command === Command.Cancel) {
          this.panel?.dispose();
        }

        if (message.command === Command.ShowSwitcher) {
          const picked = await pickGenerator();
          if (picked) {
            // Close the current wizard (triggers WizzardClosedError so the
            // running command bails out) and hand off to the chosen one.
            this.panel?.dispose();
            await vscode.commands.executeCommand(picked);
          }
        }

        if (message.command === Command.Preview && this.previewHandler) {
          const result = await this.previewHandler(message.data);
          this.panel?.webview.postMessage({
            command: Command.PreviewResult,
            data: result,
          });
        }
      });

      this.panel?.onDidDispose(() => {
        if (!completed) {
          clearInterval(it);
          reject(new WizzardClosedError());
        }
      });

      it = setTimeout(() => {
        if (!loaded) {
          this.panel?.dispose();

          console.error('Failed to load wizard', pageData);

          reject(new Error('Failed to load wizard'));
        }
      }, 5000);
    });
  }

  protected getHtml(filename: string) {
    const scriptUri = vscode.Uri.file(
      path.join(ExtensionState.context.extensionPath, 'dist', 'webview', 'index.js')
    );
    const scriptSrc = this.panel?.webview.asWebviewUri(scriptUri);

    if (!scriptSrc) {
      throw new Error('Failed to get script source');
    }

    const cssUri = vscode.Uri.file(
      path.join(ExtensionState.context.extensionPath, 'dist', 'webview', 'index.css')
    );
    const cssSrc = this.panel?.webview.asWebviewUri(cssUri);

    if (!cssSrc) {
      throw new Error('Failed to get CSS source');
    }

    const html = super.getHtml(filename);
    return html
      .replace('{{APP_SCRIPT}}', scriptSrc.toString())
      .replace('{{APP_CSS}}', cssSrc.toString());
  }
}
