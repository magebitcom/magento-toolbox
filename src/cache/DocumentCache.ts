import { TextDocument } from 'vscode';

class DocumentCache {
  protected cache: Map<string, any> = new Map();

  public get(document: TextDocument, key: string) {
    const cacheKey = this.getCacheKey(document, key);
    return this.cache.get(cacheKey);
  }

  public set(document: TextDocument, key: string, value: any) {
    const cacheKey = this.getCacheKey(document, key);
    this.cache.set(cacheKey, value);
  }

  public delete(document: TextDocument, key: string) {
    const cacheKey = this.getCacheKey(document, key);
    this.cache.delete(cacheKey);
  }

  public clear(document: TextDocument) {
    this.cache.forEach((value, key) => {
      if (key.startsWith(document.uri.fsPath)) {
        this.cache.delete(key);
      }
    });
  }

  public has(document: TextDocument, key: string) {
    const cacheKey = this.getCacheKey(document, key);
    return this.cache.has(cacheKey);
  }

  protected getCacheKey(document: TextDocument, key: string) {
    return `${document.uri.fsPath}-${key}`;
  }
}

export default new DocumentCache();
