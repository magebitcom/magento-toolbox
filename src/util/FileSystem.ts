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
}
