import FileSystem from 'util/FileSystem';
import { Uri, workspace, window } from 'vscode';

export default class GeneratedFile {
  public constructor(
    public readonly uri: Uri,
    public readonly content: string,
    private readonly confirmOverwrite: boolean = true
  ) {}

  public open(): void {
    workspace.openTextDocument(this.uri).then(window.showTextDocument);
  }

  public async write(): Promise<boolean> {
    if (this.confirmOverwrite && (await FileSystem.fileExists(this.uri))) {
      const result = await window.showQuickPick(
        [
          { label: 'Overwrite', description: 'Overwrite the existing file', picked: true },
          { label: 'Skip', description: 'Skip the file' },
        ],
        {
          title: `File already exists: ${this.uri.fsPath}`,
        }
      );

      if (result?.label === 'Skip') {
        return false;
      }
    }

    await workspace.fs.writeFile(this.uri, Buffer.from(this.content, 'utf-8'));
    return true;
  }
}
