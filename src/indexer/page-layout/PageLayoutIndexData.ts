import { Memoize } from 'typescript-memoize';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { PageLayout } from './types';
import PageLayoutIndexer from './PageLayoutIndexer';

export class PageLayoutIndexData extends AbstractIndexData<PageLayout> {
  @Memoize({
    tags: [PageLayoutIndexer.KEY],
  })
  public getPageLayouts(): PageLayout[] {
    return Array.from(this.data.values()).flat();
  }
}
