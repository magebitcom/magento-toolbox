export default class IndexStorage {
  private static _indexStorage: Record<string, any> = {};

  public static set<T extends keyof IndexerData>(key: T, value: IndexerData[T]) {
    this._indexStorage[key] = value;
  }

  public static get<T extends keyof IndexerData>(key: T): IndexerData[T] | undefined {
    return this._indexStorage[key];
  }

  public static clear() {
    this._indexStorage = {};
  }

  public static async load() {
    // TODO: Implement
  }

  public static async save() {
    // TODO: Implement
  }
}
