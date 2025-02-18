import { WorkspaceFolder } from 'vscode';

export type IndexerStorage<T = any> = Record<string, Record<string, Map<string, T>>>;

export default class IndexStorage {
  private _indexStorage: IndexerStorage = {};

  public set(workspaceFolder: WorkspaceFolder, key: string, value: any) {
    if (!this._indexStorage[workspaceFolder.uri.fsPath]) {
      this._indexStorage[workspaceFolder.uri.fsPath] = {};
    }

    this._indexStorage[workspaceFolder.uri.fsPath][key] = value;
  }

  public get<T = any>(workspaceFolder: WorkspaceFolder, key: string): Map<string, T> | undefined {
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
