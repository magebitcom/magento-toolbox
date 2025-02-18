import { workspace } from 'vscode';

export default class FileHeader {
  public static getHeader(module: string): string | undefined {
    const header = workspace
      .getConfiguration('magento-toolbox')
      .get<string>('phpFileHeaderComment');

    if (!header) {
      return undefined;
    }

    return header.replace('%module%', module);
  }
}
