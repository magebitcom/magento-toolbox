import { RelativePattern, Uri } from 'vscode';
import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';
import { IndexerKey } from 'types/indexer';
import { Theme } from './types';

export default class ThemeIndexer extends Indexer<Theme> {
  public static readonly KEY = 'theme';

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return ThemeIndexer.KEY;
  }

  public getName(): string {
    return 'theme.xml';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/theme.xml');
  }

  public canIndex(uri: Uri): boolean {
    return !uri.fsPath.includes('Test/Unit') && !uri.fsPath.includes('dev/tests');
  }

  public async indexFile(uri: Uri): Promise<Theme | undefined> {
    const id = await this.getThemeId(uri);

    if (!id) {
      return undefined;
    }

    const xml = await FileSystem.readFile(uri);
    const parsed = this.xmlParser.parse(xml);

    const titleRaw = get(parsed, 'theme.title');
    const parentRaw = get(parsed, 'theme.parent');

    const title = Array.isArray(titleRaw) ? titleRaw[0] : titleRaw;
    const parent = Array.isArray(parentRaw) ? parentRaw[0] : parentRaw;

    if (!title || typeof title !== 'string') {
      return undefined;
    }

    const theme: Theme = {
      title,
      id,
      path: uri.fsPath,
      basePath: Uri.joinPath(uri, '..').fsPath,
      parent: typeof parent === 'string' ? parent : undefined,
    };

    return theme;
  }

  private async getThemeId(uri: Uri): Promise<string | undefined> {
    const registrationUri = Uri.joinPath(uri, '../registration.php');

    let registration: string | undefined;
    try {
      registration = await FileSystem.readFile(registrationUri);
    } catch (error) {
      return undefined;
    }

    const themeId = registration.match(/'frontend\/(.+)'/);

    if (!themeId) {
      return undefined;
    }

    return themeId[1];
  }
}
