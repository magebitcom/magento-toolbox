import { Memoize } from 'typescript-memoize';
import { IndexedFilePath } from 'types/indexer';

export abstract class AbstractIndexData<T = any> {
  public constructor(protected data: Map<IndexedFilePath, T>) {}

  @Memoize()
  public getValues(): T[] {
    return Array.from(this.data.values());
  }
}
