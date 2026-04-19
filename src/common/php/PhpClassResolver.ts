import { trimStart } from 'lodash-es';
import { Uri, workspace } from 'vscode';
import PhpNamespace from 'common/PhpNamespace';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import DiIndexer from 'indexer/di/DiIndexer';
import IndexManager from 'indexer/IndexManager';
import FileSystem from 'util/FileSystem';

type Visibility = 'public' | 'protected' | 'private';

interface MethodLookup {
  exists: boolean;
  visibility: Visibility;
  file: string;
}

class PhpClassResolver {
  private static readonly SUFFIXES = ['Factory', 'Proxy'];

  private classExistCache = new Map<string, boolean>();
  private methodLookupCache = new Map<string, MethodLookup | null>();

  public invalidate(): void {
    this.classExistCache.clear();
    this.methodLookupCache.clear();
  }

  public async classExists(
    fqn: string,
    options: { allowVirtualType?: boolean } = {}
  ): Promise<boolean> {
    const cleaned = this.normalize(fqn);
    if (!cleaned) return false;

    if (options.allowVirtualType && this.virtualTypeExists(cleaned)) {
      return true;
    }

    if (this.classExistCache.has(cleaned)) {
      return this.classExistCache.get(cleaned)!;
    }

    const uri = await this.resolveUri(cleaned);
    const exists = uri ? await FileSystem.fileExists(uri) : false;
    this.classExistCache.set(cleaned, exists);
    return exists;
  }

  public virtualTypeExists(name: string): boolean {
    const cleaned = this.normalize(name);
    if (!cleaned) return false;
    const di = IndexManager.getIndexData(DiIndexer.KEY);
    return di ? di.findVirtualTypeByName(cleaned) !== undefined : false;
  }

  public async typeOrVirtualTypeExists(name: string): Promise<boolean> {
    return this.classExists(name, { allowVirtualType: true });
  }

  public async methodLookup(fqn: string, method: string): Promise<MethodLookup | null> {
    const cleaned = this.normalize(fqn);
    if (!cleaned || !method) return null;

    const cacheKey = `${cleaned}::${method}`;
    if (this.methodLookupCache.has(cacheKey)) {
      return this.methodLookupCache.get(cacheKey)!;
    }

    const uri = await this.resolveUri(cleaned);
    if (!uri || !(await FileSystem.fileExists(uri))) {
      this.methodLookupCache.set(cacheKey, null);
      return null;
    }

    let result: MethodLookup | null = null;
    try {
      const phpDoc = await workspace.openTextDocument(uri);
      const phpFile = await PhpDocumentParser.parseUri(phpDoc, uri);
      const classlike = phpFile.classes[0] ?? phpFile.interfaces[0];
      if (classlike) {
        const m = classlike.methods?.find(x => x.name === method);
        if (m) {
          const visibility = ((m.ast as any).visibility as Visibility) || 'public';
          result = { exists: true, visibility, file: uri.fsPath };
        } else {
          result = { exists: false, visibility: 'public', file: uri.fsPath };
        }
      }
    } catch {
      result = null;
    }

    this.methodLookupCache.set(cacheKey, result);
    return result;
  }

  private normalize(fqn: string | undefined): string {
    if (!fqn) return '';
    return trimStart(fqn.trim(), '\\');
  }

  private async resolveUri(fqn: string): Promise<Uri | undefined> {
    const autoload = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);
    if (!autoload) return undefined;

    const parts = fqn.split('\\').filter(Boolean);
    if (!parts.length) return undefined;

    const last = parts[parts.length - 1];
    const withoutSuffix =
      PhpClassResolver.SUFFIXES.includes(last) && parts.length > 1 ? parts.slice(0, -1) : parts;

    return autoload.findUriByNamespace(PhpNamespace.fromParts(withoutSuffix.slice()));
  }
}

export default new PhpClassResolver();
