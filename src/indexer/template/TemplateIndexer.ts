import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import { Template } from './types';

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

  public getPattern(): string {
    return '**/view/**/templates/**/*.phtml';
  }

  public async indexFile(filePath: string): Promise<Template[]> {
    // const magentoPath = GetMagentoPath.getMagentoPath(filePath);

    // if (!magentoPath) {
    //   return [];
    // }

    // return [
    //   {
    //     path: filePath,
    //     magentoPath,
    //   },
    // ];
    return [];
  }
}
