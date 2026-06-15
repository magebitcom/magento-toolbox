import { Webview } from './Webview';
import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import { Command, Message, Wizard } from 'types/webview';
import ExtensionState from 'common/ExtensionState';
import WizzardClosedError from './error/WizzardClosedError';

export class GeneratorWizard extends Webview {
  protected async openWizard<D>(pageData: Wizard): Promise<D> {
    let it: NodeJS.Timeout;
    let loaded = false;
    let completed = false;

    return new Promise((resolve, reject) => {
      this.open(
        'magento-toolbox.generatorWizard',
        'Magento Toolbox: Generator Wizard',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(ExtensionState.context.extensionPath, 'dist', 'webview')),
          ],
        }
      );

      this.panel?.webview.onDidReceiveMessage((message: Message) => {
        // The webview is untrusted: only act on known commands with a well-formed payload.
        if (!message || typeof message.command !== 'string') {
          return;
        }

        if (message.command === Command.Ready) {
          loaded = true;
          clearInterval(it);
          this.panel?.webview.postMessage({
            command: Command.ShowWizard,
            data: pageData,
          });
        }

        if (message.command === Command.Submit) {
          if (typeof message.data !== 'object' || message.data === null) {
            return;
          }

          completed = true;
          this.panel?.dispose();
          resolve(message.data);
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

    const cspSource = this.panel?.webview.cspSource;

    if (!cspSource) {
      throw new Error('Failed to get webview CSP source');
    }

    const nonce = crypto.randomBytes(16).toString('base64');
    const csp = [
      `default-src 'none'`,
      `img-src ${cspSource} https: data:`,
      `font-src ${cspSource}`,
      `style-src ${cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
    ].join('; ');

    const html = super.getHtml(filename);
    return html
      .replace('{{CSP}}', csp)
      .replace('{{NONCE}}', nonce)
      .replace('{{APP_SCRIPT}}', scriptSrc.toString())
      .replace('{{APP_CSS}}', cssSrc.toString());
  }
}
