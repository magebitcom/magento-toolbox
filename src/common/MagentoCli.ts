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
    const parts = [this.magentoCliPath, command, ...args].map(MagentoCli.quote);
    const cmd = parts.join(' ');

    const terminal = this.getOrCreateTerminal();

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeout: NodeJS.Timeout;

      // Resolve only for the execution in our own terminal, and tear the listener
      // down once settled so it does not leak or resolve a later run's promise.
      const listener = vscode.window.onDidEndTerminalShellExecution(event => {
        if (event.terminal !== terminal || settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);
        listener.dispose();
        resolve(event.exitCode ?? 0);
      });

      timeout = setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        listener.dispose();
        reject(new Error('Timeout'));
      }, 30000);

      terminal.show();
      terminal.sendText(cmd, true);
    });
  }

  /**
   * Single-quote a shell token so values from configuration (e.g. magentoCliPath)
   * or arguments cannot inject additional commands.
   *
   * @param value The raw token to quote.
   * @returns The shell-safe, single-quoted token.
   */
  private static quote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
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
