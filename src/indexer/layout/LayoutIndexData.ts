import { Memoize } from 'typescript-memoize';
import { Layout } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import LayoutIndexer from './LayoutIndexer';

export class LayoutIndexData extends AbstractIndexData<Layout> {
  @Memoize({
    tags: [LayoutIndexer.KEY],
  })
  public getLayouts(): Layout[] {
    return Array.from(this.data.values()).flat();
  }
}
