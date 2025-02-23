import { workspace } from 'vscode';

export default class FileHeader {
  public static getHeader(module: string): string | undefined {
    const header = workspace
      .getConfiguration('magento-toolbox')
      .get<string>('xmlFileHeaderComment');

    if (!header) {
      return undefined;
    }

    let headerComment = '<!--\n';

    headerComment += header.replace('%module%', module);

    headerComment += '\n-->';

    return headerComment;
  }
}
