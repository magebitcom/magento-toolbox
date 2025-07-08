import { Uri } from 'vscode';
import PhpNamespace from 'common/PhpNamespace';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { Memoize } from 'typescript-memoize';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import { Namespace } from './types';
import path from 'path';

export class AutoloadNamespaceIndexData extends AbstractIndexData<Namespace[]> {
  private static readonly SPECIAL_CLASSNAMES = ['Proxy', 'Factory'];

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

    if (AutoloadNamespaceIndexData.SPECIAL_CLASSNAMES.includes(phpNamespace.getTail())) {
      phpNamespace.pop();
    }

    const namespace = namespaces.find(n => n.fqn === phpNamespace.toString());

    if (!namespace) {
      return undefined;
    }

    return Uri.file(path.join(namespace.baseDirectory, namespace.path));
  }

  public findNamespacesByPrefix(prefix: string): Namespace[] {
    const namespaces = this.getNamespaces();
    return namespaces.filter(namespace => namespace.fqn.startsWith(prefix));
  }
}
