import { WorkspaceFolder } from 'vscode';
import { IndexerKey, IndexerStorage, IndexedFilePath } from 'types/indexer';

export default class IndexStorage {
  private _indexStorage: IndexerStorage = {};

  public set(workspaceFolder: WorkspaceFolder, key: IndexerKey, value: Map<IndexedFilePath, any>) {
    if (!this._indexStorage[workspaceFolder.uri.fsPath]) {
      this._indexStorage[workspaceFolder.uri.fsPath] = {};
    }

    this._indexStorage[workspaceFolder.uri.fsPath][key] = value;
  }

  public get<T = any>(
    workspaceFolder: WorkspaceFolder,
    key: IndexerKey
  ): Map<IndexedFilePath, T> | undefined {
    return this._indexStorage[workspaceFolder.uri.fsPath]?.[key];
  }

  public clear() {
    this._indexStorage = {};
  }

  public async load() {
    // TODO: Implement
  }

  public async save() {
    // TODO: Implement
  }
}
