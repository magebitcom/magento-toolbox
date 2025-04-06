import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import { Template } from './types';
import GetMagentoPath from 'common/GetMagentoPath';

export default class TemplateIndexer extends Indexer<Template[]> {
  public static readonly KEY = 'template';

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return TemplateIndexer.KEY;
  }

  public getName(): string {
    return 'templates';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/view/**/templates/**/*.phtml');
  }

  public async indexFile(uri: Uri): Promise<Template[]> {
    const magentoPath = GetMagentoPath.getMagentoPath(uri);

    if (!magentoPath) {
      return [];
    }

    return [
      {
        path: uri.fsPath,
        magentoPath,
      },
    ];
  }
}
