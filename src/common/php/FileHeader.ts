import Config from 'common/Config';

export default class FileHeader {
  public static getHeader(module: string): string | undefined {
    const header = Config.get<string>('phpFileHeaderComment');

    if (!header) {
      return undefined;
    }

    return header.replace('%module%', module);
  }

  public static getHeaderAsComment(module: string): string {
    const header = this.getHeader(module);

    if (!header) {
      return '';
    }

    let comment = `/**\n`;

    header.split(/[\r\n]+/).forEach(line => {
      comment += ` * ${line}\n`;
    });

    comment += ` */\n`;

    return comment;
  }
}
