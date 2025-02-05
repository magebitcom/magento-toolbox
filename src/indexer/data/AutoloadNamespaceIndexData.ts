import { Uri } from 'vscode';
import IndexData from './IndexData';
import PhpNamespace from 'common/PhpNamespace';
import FileSystem from 'util/FileSystem';
import { JsonObject } from 'typescript-json-serializer';

export interface AutoloadNamespaceData {
  namespace: PhpNamespace;
  directories: Uri[];
}

@JsonObject()
export class AutoloadNamespaceIndexData extends IndexData {
  public namespaces: Map<string, AutoloadNamespaceData>;

  public constructor(namespaces: Map<string, AutoloadNamespaceData> = new Map()) {
    super();
    this.namespaces = namespaces;
  }

  public getNamespaces(): Map<string, AutoloadNamespaceData> {
    return this.namespaces;
  }

  public async findClassByNamespace(namespace: PhpNamespace): Promise<Uri | undefined> {
    const parts = namespace.getParts();

    for (let i = parts.length; i > 0; i--) {
      const namespace = PhpNamespace.fromParts(parts.slice(0, i));

      const namespaceData = this.namespaces.get(namespace.toString());

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
    directories: Uri[]
  ): Promise<Uri | undefined> {
    for (const directory of directories) {
      const classPath = namespace.toString().replace(/\\/g, '/');
      const fileUri = Uri.joinPath(directory, `${classPath}.php`);
      const exists = await FileSystem.fileExists(fileUri);

      if (exists) {
        return directory;
      }
    }

    return undefined;
  }
}
