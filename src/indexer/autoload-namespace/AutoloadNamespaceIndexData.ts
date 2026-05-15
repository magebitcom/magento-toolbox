import { Uri } from 'vscode';
import PhpNamespace from 'common/PhpNamespace';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { Memoize } from 'typescript-memoize';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import { Namespace } from './types';

export class AutoloadNamespaceIndexData extends AbstractIndexData<Namespace[]> {
  // 'Proxy' is appended as its own namespace segment (…\Cache\Proxy).
  // 'Factory' is appended to the class name itself (…\CollectionFactory).
  private static readonly TAIL_SEGMENT_SUFFIXES = ['Proxy'];
  private static readonly TAIL_NAME_SUFFIXES = ['Factory'];

  @Memoize({
    tags: [AutoloadNamespaceIndexer.KEY],
  })
  public getNamespaces(): Namespace[] {
    return Array.from(this.data.values()).flat();
  }

  @Memoize({
    tags: [AutoloadNamespaceIndexer.KEY],
    hashFunction: (namespace: PhpNamespace) => namespace.toString(),
  })
  public async findUriByNamespace(phpNamespace: PhpNamespace): Promise<Uri | undefined> {
    const namespaces = this.getNamespaces();

    const direct = namespaces.find(n => n.fqn === phpNamespace.toString());
    if (direct) {
      return Uri.file(direct.path);
    }

    const fallback = this.stripGeneratedSuffix(phpNamespace);
    if (!fallback) {
      return undefined;
    }

    const base = namespaces.find(n => n.fqn === fallback.toString());
    return base ? Uri.file(base.path) : undefined;
  }

  public findNamespacesByPrefix(prefix: string): Namespace[] {
    const namespaces = this.getNamespaces();
    return namespaces.filter(namespace => namespace.fqn.startsWith(prefix));
  }

  private stripGeneratedSuffix(phpNamespace: PhpNamespace): PhpNamespace | undefined {
    const parts = phpNamespace.getParts();
    if (parts.length < 2) return undefined;
    const tail = parts[parts.length - 1];

    if (AutoloadNamespaceIndexData.TAIL_SEGMENT_SUFFIXES.includes(tail)) {
      return PhpNamespace.fromParts(parts.slice(0, -1));
    }

    for (const suffix of AutoloadNamespaceIndexData.TAIL_NAME_SUFFIXES) {
      if (tail.length > suffix.length && tail.endsWith(suffix)) {
        const stripped = tail.slice(0, -suffix.length);
        return PhpNamespace.fromParts([...parts.slice(0, -1), stripped]);
      }
    }

    return undefined;
  }
}
