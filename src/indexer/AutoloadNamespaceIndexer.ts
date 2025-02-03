import { RelativePattern, Uri } from 'vscode';
import { Indexer } from './Indexer';
import PhpNamespace from 'common/PhpNamespace';
import { AutoloadNamespaceIndexData } from './data/AutoloadNamespaceIndexData';

declare global {
  interface IndexerData {
    [AutoloadNamespaceIndexer.KEY]: AutoloadNamespaceIndexData;
  }
}

export default class AutoloadNamespaceIndexer extends Indexer {
  public static readonly KEY = 'autoloadNamespace';

  private data: AutoloadNamespaceIndexData;

  public constructor() {
    super();
    this.data = new AutoloadNamespaceIndexData();
  }

  public getId(): keyof IndexerData {
    return AutoloadNamespaceIndexer.KEY;
  }

  public getName(): string {
    return 'Autoload namespaces';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/composer.json');
  }

  public async indexFile(uri: Uri): Promise<void> {
    const content = await this.readFile(uri);
    const composer = JSON.parse(content);

    if (!composer.autoload) {
      return;
    }

    const baseDir = Uri.joinPath(uri, '..');

    // Handle PSR-4 autoloading
    if (composer.autoload['psr-4']) {
      for (const [namespace, paths] of Object.entries(composer.autoload['psr-4'])) {
        const directories = Array.isArray(paths) ? paths : [paths];

        const namespaceData = {
          namespace: PhpNamespace.fromString(namespace),
          directories: directories.map((dir: string) =>
            Uri.joinPath(baseDir, dir.replace(/^\.\//, ''))
          ),
        };

        this.data.namespaces.set(PhpNamespace.fromString(namespace).toString(), namespaceData);
      }
    }

    // Handle PSR-0 autoloading
    if (composer.autoload['psr-0']) {
      for (const [namespace, paths] of Object.entries(composer.autoload['psr-0'])) {
        const directories = Array.isArray(paths) ? paths : [paths];

        const namespaceData = {
          namespace: PhpNamespace.fromString(namespace),
          directories: directories.map((dir: string) =>
            Uri.joinPath(baseDir, dir.replace(/^\.\//, ''))
          ),
        };

        this.data.namespaces.set(PhpNamespace.fromString(namespace).toString(), namespaceData);
      }
    }
  }

  public getData(): AutoloadNamespaceIndexData {
    return this.data;
  }

  public clear(): void {
    this.data = new AutoloadNamespaceIndexData();
  }
}
