import { Uri, workspace, window } from 'vscode';
import GeneratedFile from './GeneratedFile';

export default abstract class FileGenerator {
  public abstract generate(workspaceUri: Uri): Promise<GeneratedFile>;

  public async writeFile(uri: Uri, data: string): Promise<void> {
    await workspace.fs.writeFile(uri, Buffer.from(data, 'utf-8'));
  }

  public openFile(uri: Uri): void {
    workspace.openTextDocument(uri).then(window.showTextDocument);
  }
}
