import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { RequireJsConfig } from './types';
import { Memoize } from 'typescript-memoize';
import RequireJsIndexer from './RequireJsIndexer';

export class RequireJsIndexData extends AbstractIndexData<RequireJsConfig> {
  @Memoize({
    tags: [RequireJsIndexer.KEY],
  })
  public getConfigs(): RequireJsConfig[] {
    return Array.from(this.data.values());
  }
}
