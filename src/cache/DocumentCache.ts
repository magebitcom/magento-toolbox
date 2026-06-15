import { TextDocument } from 'vscode';

interface CacheEntry {
  version: number;
  value: any;
}

class DocumentCache {
  protected cache: Map<string, CacheEntry> = new Map();

  public get(document: TextDocument, key: string) {
    const entry = this.cache.get(this.getCacheKey(document, key));

    if (!entry || entry.version !== document.version) {
      return undefined;
    }

    return entry.value;
  }

  public set(document: TextDocument, key: string, value: any) {
    this.cache.set(this.getCacheKey(document, key), { version: document.version, value });
  }

  public delete(document: TextDocument, key: string) {
    this.cache.delete(this.getCacheKey(document, key));
  }

  public clear(document: TextDocument) {
    const prefix = `${document.uri.fsPath}-`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  public has(document: TextDocument, key: string) {
    const entry = this.cache.get(this.getCacheKey(document, key));

    return entry !== undefined && entry.version === document.version;
  }

  protected getCacheKey(document: TextDocument, key: string) {
    return `${document.uri.fsPath}-${key}`;
  }
}

export default new DocumentCache();
