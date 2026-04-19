import { Disposable, WorkspaceFolder } from 'vscode';
import { AbstractIndexData } from './AbstractIndexData';
import { Indexer } from './Indexer';
import { IndexedFilePath } from 'types/indexer';

export interface IndexerWatcherContext<T = any> {
  readonly workspaceFolder: WorkspaceFolder;
  readonly key: string;
  readonly indexer: Indexer;
  getData(): Map<IndexedFilePath, T>;
  commit(data: Map<IndexedFilePath, T>): Promise<void>;
}

export interface IndexerDefinition<
  K extends string = string,
  D extends AbstractIndexData = AbstractIndexData,
> {
  readonly key: K;
  createIndexer(): Indexer<any>;
  createData(raw: Map<IndexedFilePath, any>): D;
  watchAdditional?(context: IndexerWatcherContext): Disposable[];
}

export function defineIndexer<K extends string, D extends AbstractIndexData>(
  config: IndexerDefinition<K, D>
): IndexerDefinition<K, D> {
  return config;
}
