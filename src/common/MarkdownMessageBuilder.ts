import { MarkdownString } from 'vscode';

export default class MarkdownMessageBuilder {
  private string: MarkdownString;

  public constructor(title: string) {
    let t = '[Magento Toolbox]';

    if (title) {
      t += ` - ${title}`;
    }

    this.string = new MarkdownString(`**${t}**\n\n`);
  }

  public static create(title: string): MarkdownMessageBuilder {
    return new MarkdownMessageBuilder(title);
  }

  public build(): MarkdownString {
    return this.string;
  }

  public appendText(line: string): void {
    this.string.appendText(line);
  }

  public appendMarkdown(line: string): void {
    this.string.appendMarkdown(line);
  }

  public appendCodeblock(code: string, language?: string): void {
    this.string.appendCodeblock(code, language);
  }
}
