import { Uri } from 'vscode';
import PhpNamespace from 'common/PhpNamespace';
import FileSystem from 'util/FileSystem';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { AutoloadNamespaceData } from './types';
import { Memoize } from 'typescript-memoize';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';

export class AutoloadNamespaceIndexData extends AbstractIndexData<AutoloadNamespaceData> {
  private static readonly SPECIAL_CLASSNAMES = ['Proxy', 'Factory'];

  @Memoize({
    tags: [AutoloadNamespaceIndexer.KEY],
    hashFunction: (namespace: PhpNamespace) => namespace.toString(),
  })
  public async findClassByNamespace(namespace: PhpNamespace): Promise<Uri | undefined> {
    const parts = namespace.getParts();

    for (let i = parts.length; i >= 0; i--) {
      const namespace = PhpNamespace.fromParts(parts.slice(0, i)).toString();

      const directories = this.getDirectoriesByNamespace(namespace);

      if (directories.length === 0) {
        continue;
      }

      let className = parts.pop() as string;

      if (AutoloadNamespaceIndexData.SPECIAL_CLASSNAMES.includes(className)) {
        className = parts.pop() as string;
      }

      const classNamespace = PhpNamespace.fromParts(parts.slice(i)).append(className);

      const directory = await this.findNamespaceDirectory(classNamespace, directories);

      if (!directory) {
        continue;
      }

      const classPath = classNamespace.toString().replace(/\\/g, '/');
      const fileUri = Uri.joinPath(directory, `${classPath}.php`);

      return fileUri;
    }

    return undefined;
  }

  private getDirectoriesByNamespace(namespace: string): string[] {
    const namespaceData = this.getValues().filter(data => data[namespace] !== undefined);

    if (!namespaceData) {
      return [];
    }

    return namespaceData.flatMap(data => data[namespace] ?? []);
  }

  private async findNamespaceDirectory(
    namespace: PhpNamespace,
    directories: string[]
  ): Promise<Uri | undefined> {
    for (const directory of directories) {
      const directoryUri = Uri.file(directory);
      const classPath = namespace.toString().replace(/\\/g, '/');
      const fileUri = Uri.joinPath(directoryUri, `${classPath}.php`);
      const exists = await FileSystem.fileExists(fileUri);

      if (exists) {
        return directoryUri;
      }
    }

    return undefined;
  }
}
