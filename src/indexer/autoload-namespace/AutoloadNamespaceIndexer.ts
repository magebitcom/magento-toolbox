import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import FileSystem from 'util/FileSystem';
import { AutoloadNamespaceData } from './types';

export default class AutoloadNamespaceIndexer extends Indexer<AutoloadNamespaceData> {
  public static readonly KEY = 'autoloadNamespace';

  public getId(): string {
    return AutoloadNamespaceIndexer.KEY;
  }

  public getName(): string {
    return 'namespaces';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/composer.json');
  }

  public async indexFile(uri: Uri): Promise<AutoloadNamespaceData | undefined> {
    const content = await FileSystem.readFile(uri);
    const composer = JSON.parse(content);

    if (!composer.autoload) {
      return;
    }

    const baseDir = Uri.joinPath(uri, '..');
    const data: AutoloadNamespaceData = {};

    // Handle PSR-4 autoloading
    if (composer.autoload['psr-4']) {
      for (const [namespace, paths] of Object.entries(composer.autoload['psr-4'])) {
        const directories = Array.isArray(paths) ? paths : [paths];

        data[this.normalizeNamespace(namespace)] = directories.map(
          (dir: string) => Uri.joinPath(baseDir, dir.replace(/^\.\//, '')).fsPath
        );
      }
    }

    // Handle PSR-0 autoloading
    if (composer.autoload['psr-0']) {
      for (const [namespace, paths] of Object.entries(composer.autoload['psr-0'])) {
        const directories = Array.isArray(paths) ? paths : [paths];

        data[this.normalizeNamespace(namespace)] = directories.map(
          (dir: string) => Uri.joinPath(baseDir, dir.replace(/^\.\//, '')).fsPath
        );
      }
    }

    return data;
  }

  private normalizeNamespace(namespace: string): string {
    return namespace.replace(/\\$/, '');
  }
}
