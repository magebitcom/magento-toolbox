import { window } from 'vscode';

export class Logger {
  private channel = window.createOutputChannel('Magento Toolbox');

  public log(category: string, ...message: (string | number)[]) {
    const text = [`[${category}]`, ...message].join(' ');
    this.channel.appendLine(text);
  }

  public logWithTime(category: string, ...message: (string | number)[]) {
    this.log(category, new Date().toISOString(), ...message);
  }

  public error(category: string, ...message: (string | number)[]) {
    this.log(category, 'ERROR', ...message);
  }
}

export default new Logger();
