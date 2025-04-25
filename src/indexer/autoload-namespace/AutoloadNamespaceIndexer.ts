import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';
import { Namespace } from './types';
import { IndexerKey } from 'types/indexer';

export default class AutoloadNamespaceIndexer extends Indexer<Namespace[]> {
  public static readonly KEY = 'autoloadNamespace';

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return AutoloadNamespaceIndexer.KEY;
  }

  public getName(): string {
    return 'namespaces';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/composer.json');
  }

  public async indexFile(uri: Uri): Promise<Namespace[] | undefined> {
    const content = await FileSystem.readFile(uri);
    const composer = JSON.parse(content);

    if (!composer.autoload) {
      return;
    }

    const baseDir = Uri.joinPath(uri, '..');
    const data: Namespace[] = [];

    // Handle PSR-4 autoloading
    if (composer.autoload['psr-4']) {
      const namespaces = await this.indexNamespaces(composer.autoload['psr-4'], baseDir);

      data.push(...namespaces);
    }

    // // Handle PSR-0 autoloading
    if (composer.autoload['psr-0']) {
      const namespaces = await this.indexNamespaces(composer.autoload['psr-0'], baseDir);

      data.push(...namespaces);
    }

    return data;
  }

  private async indexNamespaces(
    autoLoadData: Record<string, string[]>,
    baseDir: Uri
  ): Promise<Namespace[]> {
    const promises: Promise<Namespace[]>[] = [];

    for (const [namespace, paths] of Object.entries(autoLoadData)) {
      const directories = Array.isArray(paths) ? paths : [paths];

      for (const directory of directories) {
        promises.push(this.expandNamespaces(namespace, baseDir, directory));
      }
    }

    const namespaces = await Promise.all(promises);
    return namespaces.flat();
  }

  private async expandNamespaces(
    baseNamespace: string,
    baseDirectory: Uri,
    relativeBaseDirectory: string
  ): Promise<Namespace[]> {
    const baseDirectoryUri = Uri.joinPath(baseDirectory, relativeBaseDirectory.replace(/\\$/, ''));
    const files = await FileSystem.readDirectoryRecursive(
      baseDirectoryUri,
      new RelativePattern(baseDirectoryUri, '**/*.php')
    );

    return files
      .filter(file => file.endsWith('.php'))
      .filter(file => {
        const parts = file.split('/');
        const filename = parts[parts.length - 1];
        return filename.charAt(0) === filename.charAt(0).toUpperCase();
      })
      .map(file => {
        const namespace = file.replace('.php', '');

        const fqn = this.normalizeNamespace(
          `${this.normalizeNamespace(baseNamespace)}\\${namespace.replace(/\//g, '\\')}`
        );

        return {
          fqn,
          prefix: baseNamespace,
          baseDirectory: baseDirectoryUri.fsPath,
          path: Uri.joinPath(baseDirectoryUri, file).fsPath,
        };
      });
  }

  private normalizeNamespace(namespace: string): string {
    return namespace.replace(/\\$/, '').replace(/^\\/, '');
  }
}
