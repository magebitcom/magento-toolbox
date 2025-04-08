import { WorkspaceFolder } from 'vscode';
import { IndexerKey, IndexerStorage, IndexedFilePath, SavedIndex } from 'types/indexer';
import { IndexDataSerializer } from './IndexDataSerializer';
import Context from 'common/Context';
import ExtensionState from 'common/ExtensionState';

export default class IndexStorage {
  private _indexStorage: IndexerStorage = {};
  private serializer = new IndexDataSerializer();

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

  public hasIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey) {
    return !!this._indexStorage[workspaceFolder.uri.fsPath]?.[key];
  }

  public saveIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey, version: number) {
    const indexData = this._indexStorage[workspaceFolder.uri.fsPath][key];

    const savedIndex: SavedIndex = {
      version,
      data: indexData,
    };
    const serialized = this.serializer.serialize(savedIndex);

    ExtensionState.context.globalState.update(
      `index-storage-${workspaceFolder.uri.fsPath}-${key}`,
      serialized
    );
  }

  public loadIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey, version: number) {
    const serialized = ExtensionState.context.globalState.get<string>(
      `index-storage-${workspaceFolder.uri.fsPath}-${key}`
    );

    if (!serialized) {
      return undefined;
    }

    const savedIndex = this.serializer.deserialize(serialized);

    if (savedIndex.version !== version) {
      return undefined;
    }

    if (!this._indexStorage[workspaceFolder.uri.fsPath]) {
      this._indexStorage[workspaceFolder.uri.fsPath] = {};
    }

    this._indexStorage[workspaceFolder.uri.fsPath][key] = savedIndex.data;
  }
}
