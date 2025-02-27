import * as vscode from 'vscode';

export default class MagentoCli {
  private static readonly TERMINAL_NAME = 'Magento Toolbox';
  private static DEFAULT_CLI_PATH = 'bin/magento';

  private magentoCliPath: string;

  public constructor() {
    this.magentoCliPath =
      vscode.workspace.getConfiguration('magento-toolbox').get<string>('magentoCliPath') ||
      MagentoCli.DEFAULT_CLI_PATH;
  }

  public async run(command: string, args: string[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
      const cmd = `${this.magentoCliPath} ${command} ${args.join(' ')}`;

      const terminal = this.getOrCreateTerminal();
      let timeout: NodeJS.Timeout;

      terminal.show();
      terminal.sendText(cmd, true);

      vscode.window.onDidEndTerminalShellExecution(event => {
        if (event.terminal.name === MagentoCli.TERMINAL_NAME) {
          clearTimeout(timeout);

          resolve(event.exitCode ?? 0);
        }
      });

      timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, 30000);
    });
  }

  public dispose() {
    const terminal = vscode.window.terminals.find(t => t.name === MagentoCli.TERMINAL_NAME);

    if (terminal) {
      terminal.dispose();
    }
  }

  private getOrCreateTerminal(): vscode.Terminal {
    const terminal = vscode.window.terminals.find(t => t.name === MagentoCli.TERMINAL_NAME);

    if (terminal) {
      return terminal;
    }

    return vscode.window.createTerminal(MagentoCli.TERMINAL_NAME);
  }
}
