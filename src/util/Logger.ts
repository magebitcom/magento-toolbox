import { window } from 'vscode';

export class Logger {
  private channel = window.createOutputChannel('Magento Toolbox');

  public log(...message: string[]) {
    this.channel.appendLine(message.join(' '));
  }

  public logWithTime(...message: string[]) {
    this.log(new Date().toISOString(), ...message);
  }
}

export default new Logger();
