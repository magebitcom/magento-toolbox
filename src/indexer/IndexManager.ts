import { Progress, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Indexer } from './Indexer';
import Common from 'util/Common';
import { minimatch } from 'minimatch';
import DiIndexer from './di/DiIndexer';
import IndexStorage from './IndexStorage';
import ModuleIndexer from './module/ModuleIndexer';
import AutoloadNamespaceIndexer from './autoload-namespace/AutoloadNamespaceIndexer';
import { clear } from 'typescript-memoize';
import EventsIndexer from './events/EventsIndexer';
import { DiIndexData } from './di/DiIndexData';
import { ModuleIndexData } from './module/ModuleIndexData';
import { AutoloadNamespaceIndexData } from './autoload-namespace/AutoloadNamespaceIndexData';
import { EventsIndexData } from './events/EventsIndexData';

type IndexerInstance = DiIndexer | ModuleIndexer | AutoloadNamespaceIndexer | EventsIndexer;

type IndexerDataMap = {
  [DiIndexer.KEY]: DiIndexData;
  [ModuleIndexer.KEY]: ModuleIndexData;
  [AutoloadNamespaceIndexer.KEY]: AutoloadNamespaceIndexData;
  [EventsIndexer.KEY]: EventsIndexData;
};

class IndexManager {
  protected indexers: IndexerInstance[] = [];
  protected indexStorage: IndexStorage;

  public constructor() {
    this.indexers = [
      new DiIndexer(),
      new ModuleIndexer(),
      new AutoloadNamespaceIndexer(),
      new EventsIndexer(),
    ];
    this.indexStorage = new IndexStorage();
  }

  public getIndexers(): IndexerInstance[] {
    return this.indexers;
  }

  public getIndexer<I extends IndexerInstance>(name: string): I | undefined {
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
      progress.report({ message: `Indexing - ${indexer.getName()}`, increment: 0 });

      const indexData = this.getIndexStorageData(indexer.getId()) || new Map();

      const timer = `indexer_${indexer.getId()}`;
      Common.startStopwatch(timer);
      const files = await workspace.findFiles(indexer.getPattern(workspaceUri), 'dev/**');

      let doneCount = 0;
      const totalCount = files.length;

      await Promise.all(
        files.map(async file => {
          const data = await indexer.indexFile(file);

          if (data !== undefined) {
            indexData.set(file.fsPath, data);
          }

          doneCount++;
          const pct = Math.round((doneCount / totalCount) * 100);

          progress.report({
            message: `Indexing - ${indexer.getName()} [${doneCount}/${totalCount}]`,
            increment: pct,
          });
        })
      );

      this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);

      clear([indexer.getId()]);

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

  public getIndexStorageData<T = any>(
    id: string,
    workspaceFolder?: WorkspaceFolder
  ): Map<string, T> | undefined {
    const wf = workspaceFolder || Common.getActiveWorkspaceFolder();

    if (!wf) {
      return undefined;
    }

    return this.indexStorage.get<T>(wf, id);
  }

  public getIndexData<T extends keyof IndexerDataMap>(
    id: T,
    workspaceFolder?: WorkspaceFolder
  ): IndexerDataMap[T] | undefined {
    const data = this.getIndexStorageData(id, workspaceFolder);

    if (!data) {
      return undefined;
    }

    if (id === DiIndexer.KEY) {
      return new DiIndexData(data) as IndexerDataMap[T];
    }

    if (id === ModuleIndexer.KEY) {
      return new ModuleIndexData(data) as IndexerDataMap[T];
    }

    if (id === AutoloadNamespaceIndexer.KEY) {
      return new AutoloadNamespaceIndexData(data) as IndexerDataMap[T];
    }

    if (id === EventsIndexer.KEY) {
      return new EventsIndexData(data) as IndexerDataMap[T];
    }

    return undefined;
  }

  protected async indexFileInner(
    workspaceFolder: WorkspaceFolder,
    file: Uri,
    indexer: Indexer
  ): Promise<void> {
    const indexData = this.getIndexStorageData(indexer.getId()) || new Map();
    const pattern = indexer.getPattern(workspaceFolder.uri);
    const patternString = typeof pattern === 'string' ? pattern : pattern.pattern;

    if (minimatch(file.fsPath, patternString, { matchBase: true })) {
      const data = await indexer.indexFile(file);

      if (data !== undefined) {
        indexData.set(file.fsPath, data);
      }
    }

    clear([indexer.getId()]);
  }

  protected shouldIndex(index: IndexerInstance): boolean {
    return true;
  }
}

export default new IndexManager();
