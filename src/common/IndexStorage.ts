export default class IndexStorage {
  private static _indexStorage: Map<string, any> = new Map();

  public static set<T extends keyof IndexerData>(key: T, value: IndexerData[T]) {
    this._indexStorage.set(key, value);
  }

  public static get<T extends keyof IndexerData>(key: T): IndexerData[T] | undefined {
    return this._indexStorage.get(key);
  }
}
