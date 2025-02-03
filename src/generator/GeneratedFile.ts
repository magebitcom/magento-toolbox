import { Uri, workspace, window } from 'vscode';

export default class GeneratedFile {
  public constructor(
    public readonly uri: Uri,
    public readonly content: string
  ) {}

  public open(): void {
    workspace.openTextDocument(this.uri).then(window.showTextDocument);
  }

  public async write(): Promise<void> {
    await workspace.fs.writeFile(this.uri, Buffer.from(this.content, 'utf-8'));
  }
}
