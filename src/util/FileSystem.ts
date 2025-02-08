import { Uri, workspace } from 'vscode';

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
}
