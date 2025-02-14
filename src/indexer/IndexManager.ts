import { Progress, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Indexer } from './Indexer';
import Common from 'util/Common';
import { minimatch } from 'minimatch';
import DiIndexer from './di/DiIndexer';
import IndexStorage from './IndexStorage';
import ModuleIndexer from './module/ModuleIndexer';
import AutoloadNamespaceIndexer from './autoload-namespace/AutoloadNamespaceIndexer';

class IndexManager {
  protected indexers: Indexer[] = [];
  protected indexStorage: IndexStorage;

  public constructor() {
    this.indexers = [new DiIndexer(), new ModuleIndexer(), new AutoloadNamespaceIndexer()];
    this.indexStorage = new IndexStorage();
  }

  public getIndexers(): Indexer[] {
    return this.indexers;
  }

  public getIndexer<I extends Indexer>(name: string): I | undefined {
    return this.indexers.find(index => index.getName() === name) as I | undefined;
  }

  public async indexWorkspace(
    workspaceFolder: WorkspaceFolder,
    progress: Progress<{ message?: string; increment?: number }>,
    force: boolean = false
  ): Promise<void> {
    const workspaceUri = workspaceFolder.uri;

    Common.startStopwatch('indexWorkspace');

    for (const indexer of this.indexers) {
      if (!force && !this.shouldIndex(indexer)) {
        continue;
      }

      const indexData = this.getIndexData(indexer.getId()) || new Map();

      const timer = `indexer_${indexer.getId()}`;
      Common.startStopwatch(timer);
      const files = await workspace.findFiles(indexer.getPattern(workspaceUri), 'dev/**');

      progress.report({ message: `Running indexer - ${indexer.getName()}`, increment: 0 });

      await Promise.all(
        files.map(async file => {
          const data = await indexer.indexFile(file);

          if (data !== undefined) {
            indexData.set(file.fsPath, data);
          }
        })
      );

      this.indexStorage.set(indexer.getId(), indexData);

      Common.stopStopwatch(timer);

      progress.report({ increment: 100 });
    }

    Common.stopStopwatch('indexWorkspace');
  }

  public async indexFile(workspaceFolder: WorkspaceFolder, file: Uri): Promise<void> {
    Common.startStopwatch('indexFile');

    await Promise.all(
      this.indexers.map(async indexer => {
        await this.indexFileInner(workspaceFolder, file, indexer);
      })
    );

    Common.stopStopwatch('indexFile');
  }

  public async indexFiles(workspaceFolder: WorkspaceFolder, files: Uri[]): Promise<void> {
    Common.startStopwatch('indexFiles');

    for (const indexer of this.indexers) {
      await Promise.all(files.map(file => this.indexFileInner(workspaceFolder, file, indexer)));
    }

    Common.stopStopwatch('indexFiles');
  }

  public getIndexData<T = any>(id: string): Map<string, T> | undefined {
    return this.indexStorage.get<T>(id);
  }

  protected async indexFileInner(
    workspaceFolder: WorkspaceFolder,
    file: Uri,
    indexer: Indexer
  ): Promise<void> {
    const indexData = this.getIndexData(indexer.getId()) || new Map();
    const pattern = indexer.getPattern(workspaceFolder.uri);
    const patternString = typeof pattern === 'string' ? pattern : pattern.pattern;

    if (minimatch(file.fsPath, patternString, { matchBase: true })) {
      const data = await indexer.indexFile(file);

      if (data !== undefined) {
        indexData.set(file.fsPath, data);
      }
    }
  }

  protected shouldIndex(index: Indexer): boolean {
    return true;
  }
}

export default new IndexManager();
