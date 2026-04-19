import { AbstractIndexData } from './AbstractIndexData';
import { Indexer } from './Indexer';
import { IndexedFilePath } from 'types/indexer';

export interface IndexerDefinition<
  K extends string = string,
  D extends AbstractIndexData = AbstractIndexData,
> {
  readonly key: K;
  createIndexer(): Indexer<any>;
  createData(raw: Map<IndexedFilePath, any>): D;
}

export function defineIndexer<K extends string, D extends AbstractIndexData>(
  config: IndexerDefinition<K, D>
): IndexerDefinition<K, D> {
  return config;
}
