export type IndexerKey = string;
export type IndexedFilePath = string;
type WorkspacePath = string;

export type IndexerStorage<T = any> = Record<
  WorkspacePath,
  Record<IndexerKey, Map<IndexedFilePath, T>>
>;
