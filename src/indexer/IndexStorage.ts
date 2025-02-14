export type IndexerStorage<T = any> = Record<string, Map<string, T>>;

export default class IndexStorage {
  private _indexStorage: IndexerStorage = {};

  public set(key: string, value: any) {
    this._indexStorage[key] = value;
  }

  public get<T = any>(key: string): Map<string, T> | undefined {
    return this._indexStorage[key];
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
