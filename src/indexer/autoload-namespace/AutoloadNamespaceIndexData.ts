import { Uri } from 'vscode';
import PhpNamespace from 'common/PhpNamespace';
import FileSystem from 'util/FileSystem';
import { IndexData } from 'indexer/IndexData';
import { AutoloadNamespaceData } from './types';

export class AutoloadNamespaceIndexData extends IndexData<AutoloadNamespaceData> {
  public async findClassByNamespace(namespace: PhpNamespace): Promise<Uri | undefined> {
    const parts = namespace.getParts();

    for (let i = parts.length; i > 0; i--) {
      const namespace = PhpNamespace.fromParts(parts.slice(0, i));

      const namespaceData = this.getValues().find(data => data[namespace.toString()] !== undefined);

      if (!namespaceData) {
        continue;
      }

      const className = parts.pop() as string;
      const classNamespace = PhpNamespace.fromParts(parts.slice(i)).append(className);

      const directory = await this.findNamespaceDirectory(
        classNamespace,
        namespaceData.directories
      );

      if (!directory) {
        continue;
      }

      const classPath = classNamespace.toString().replace(/\\/g, '/');
      const fileUri = Uri.joinPath(directory, `${classPath}.php`);

      return fileUri;
    }

    return undefined;
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
