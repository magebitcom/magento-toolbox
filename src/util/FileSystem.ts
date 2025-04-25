import { FileType, RelativePattern, Uri, workspace } from 'vscode';
import * as path from 'path';
import ExtensionState from 'common/ExtensionState';

export default class FileSystem {
  public static async fileExists(uri: Uri): Promise<boolean> {
    return workspace.fs
      .stat(uri)
      .then(
        () => true,
        () => false
      )
      .then(exists => {
        return exists;
      });
  }

  public static async readFile(uri: Uri): Promise<string> {
    const content = await workspace.fs.readFile(uri);
    return content.toString();
  }

  public static async readDirectory(uri: Uri): Promise<string[]> {
    const files = await workspace.fs.readDirectory(uri);
    return files.map(([name]) => name);
  }

  public static async readDirectoryRecursive(
    uri: Uri,
    pattern: RelativePattern
  ): Promise<string[]> {
    const files = await workspace.findFiles(pattern);
    return files.map(file => path.relative(uri.fsPath, file.fsPath));
  }

  public static async writeFile(uri: Uri, content: string): Promise<void> {
    await workspace.fs.writeFile(uri, Buffer.from(content));
  }

  public static getExtensionPath(dir: string): string {
    ExtensionState.context.extensionPath;
    return path.join(ExtensionState.context.extensionPath, 'dist', dir);
  }
}
