import { window } from 'vscode';

export class Logger {
  private channel = window.createOutputChannel('Magento Toolbox');

  public log(...message: (string | number)[]) {
    this.channel.appendLine(message.join(' '));
    console.log('[Magento Toolbox]', ...message);
  }

  public logWithTime(...message: (string | number)[]) {
    this.log(new Date().toISOString(), ...message);
  }

  public error(...message: (string | number)[]) {
    this.logWithTime('ERROR', ...message);
  }
}

export default new Logger();
