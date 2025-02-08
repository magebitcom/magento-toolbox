class Cache {
  protected cache: Map<string, any> = new Map();

  public get(key: string) {
    return this.cache.get(key);
  }

  public set(key: string, value: any) {
    this.cache.set(key, value);
  }

  public delete(key: string) {
    this.cache.delete(key);
  }

  public clear() {
    this.cache.clear();
  }

  public has(key: string) {
    return this.cache.has(key);
  }
}

export default new Cache();
