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

  public static async writeFile(uri: Uri, content: string): Promise<void> {
    await workspace.fs.writeFile(uri, Buffer.from(content));
  }
}
