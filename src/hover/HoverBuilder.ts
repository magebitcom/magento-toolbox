import { Hover, MarkdownString, Range, Uri } from 'vscode';

export default class HoverBuilder {
  private readonly markdown = new MarkdownString();

  public static create(): HoverBuilder {
    return new HoverBuilder();
  }

  public title(type: string, name?: string): this {
    if (name) {
      this.markdown.appendMarkdown(`**${type}**: ${name}\n\n`);
    } else {
      this.markdown.appendMarkdown(`**${type}**\n\n`);
    }
    return this;
  }

  public property(key: string, value: unknown, asCode = true): this {
    if (value === undefined || value === null || value === '') {
      return this;
    }
    const formatted = asCode ? `\`${value}\`` : String(value);
    this.markdown.appendMarkdown(`- ${key}: ${formatted}\n\n`);
    return this;
  }

  public flag(key: string, value: boolean | undefined): this {
    if (!value) {
      return this;
    }
    this.markdown.appendMarkdown(`- **${key}**\n\n`);
    return this;
  }

  public list(key: string, items: string[]): this {
    if (!items.length) {
      return this;
    }
    this.markdown.appendMarkdown(`- ${key}:\n\n    - ${items.join('\n    - ')}\n\n`);
    return this;
  }

  public text(text: string | undefined): this {
    if (!text) {
      return this;
    }
    this.markdown.appendMarkdown(`${text}\n\n`);
    return this;
  }

  public link(label: string, uri: Uri): this {
    this.markdown.appendMarkdown(`[${label}](${uri})`);
    return this;
  }

  public links(label: string, entries: { label: string; uri: Uri }[]): this {
    if (!entries.length) {
      return this;
    }
    this.markdown.appendMarkdown(`- ${label}:\n\n`);
    for (const entry of entries) {
      this.markdown.appendMarkdown(`    - [${entry.label}](${entry.uri})\n\n`);
    }
    return this;
  }

  public build(range: Range): Hover {
    return new Hover(this.markdown, range);
  }
}
