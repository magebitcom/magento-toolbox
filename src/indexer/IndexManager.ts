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
import Logger from 'util/Logger';
import { IndexerKey } from 'types/indexer';
import AclIndexer from './acl/AclIndexer';
import { AclIndexData } from './acl/AclIndexData';
import TemplateIndexer from './template/TemplateIndexer';
import { TemplateIndexData } from './template/TemplateIndexData';
import CronIndexer from './cron/CronIndexer';
import { CronIndexData } from './cron/CronIndexData';

type IndexerInstance =
  | DiIndexer
  | ModuleIndexer
  | AutoloadNamespaceIndexer
  | EventsIndexer
  | AclIndexer
  | TemplateIndexer
  | CronIndexer;

type IndexerDataMap = {
  [DiIndexer.KEY]: DiIndexData;
  [ModuleIndexer.KEY]: ModuleIndexData;
  [AutoloadNamespaceIndexer.KEY]: AutoloadNamespaceIndexData;
  [EventsIndexer.KEY]: EventsIndexData;
  [AclIndexer.KEY]: AclIndexData;
  [TemplateIndexer.KEY]: TemplateIndexData;
  [CronIndexer.KEY]: CronIndexData;
};

class IndexManager {
  private static readonly INDEX_BATCH_SIZE = 50;

  protected indexers: IndexerInstance[] = [];
  protected indexStorage: IndexStorage;

  public constructor() {
    this.indexers = [
      new DiIndexer(),
      new ModuleIndexer(),
      new AutoloadNamespaceIndexer(),
      new EventsIndexer(),
      new AclIndexer(),
      new TemplateIndexer(),
      new CronIndexer(),
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

    Logger.logWithTime('Indexing workspace', workspaceFolder.name);

    for (const indexer of this.indexers) {
      progress.report({
        message: `Indexing - ${indexer.getName()} [loading index]`,
        increment: 0,
      });
      await this.indexStorage.loadIndex(workspaceFolder, indexer.getId(), indexer.getVersion());

      if (!force && !this.shouldIndex(workspaceFolder, indexer)) {
        Logger.logWithTime('Loaded index from storage', workspaceFolder.name, indexer.getId());
        continue;
      }
      progress.report({
        message: `Indexing - ${indexer.getName()} [discovering files]`,
        increment: 0,
      });

      const indexData = this.getIndexStorageData(indexer.getId()) || new Map();

      Logger.logWithTime('Indexing', indexer.getName());
      const files = await workspace.findFiles(indexer.getPattern(workspaceUri), 'dev/**');

      let doneCount = 0;
      const totalCount = files.length;

      for (let i = 0; i < files.length; i += IndexManager.INDEX_BATCH_SIZE) {
        const batch = files.slice(i, i + IndexManager.INDEX_BATCH_SIZE);

        await Promise.all(
          batch.map(async file => {
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
      }

      this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);
      await this.indexStorage.saveIndex(workspaceFolder, indexer.getId(), indexer.getVersion());

      clear([indexer.getId()]);

      Logger.logWithTime('Indexing', indexer.getName(), 'done');

      progress.report({ increment: 100 });
    }

    Logger.logWithTime('Finished indexing workspace', workspaceFolder.name);
  }

  public async indexFile(workspaceFolder: WorkspaceFolder, file: Uri): Promise<void> {
    Logger.logWithTime('Indexing file', file.fsPath);

    await Promise.all(
      this.indexers.map(async indexer => {
        await this.indexFileInner(workspaceFolder, file, indexer);
      })
    );

    Logger.logWithTime('Finished indexing file', file.fsPath);
  }

  public async indexFiles(workspaceFolder: WorkspaceFolder, files: Uri[]): Promise<void> {
    Logger.logWithTime(`Indexing ${files.length} files`);

    for (const indexer of this.indexers) {
      await Promise.all(files.map(file => this.indexFileInner(workspaceFolder, file, indexer)));
    }

    Logger.logWithTime(`Finished indexing ${files.length} files`);
  }

  public getIndexStorageData<T = any>(
    id: IndexerKey,
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

    switch (id) {
      case DiIndexer.KEY:
        return new DiIndexData(data) as IndexerDataMap[T];

      case ModuleIndexer.KEY:
        return new ModuleIndexData(data) as IndexerDataMap[T];

      case AutoloadNamespaceIndexer.KEY:
        return new AutoloadNamespaceIndexData(data) as IndexerDataMap[T];

      case EventsIndexer.KEY:
        return new EventsIndexData(data) as IndexerDataMap[T];

      case AclIndexer.KEY:
        return new AclIndexData(data) as IndexerDataMap[T];

      case TemplateIndexer.KEY:
        return new TemplateIndexData(data) as IndexerDataMap[T];

      case CronIndexer.KEY:
        return new CronIndexData(data) as IndexerDataMap[T];

      default:
        return undefined;
    }
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

  protected shouldIndex(workspaceFolder: WorkspaceFolder, index: IndexerInstance): boolean {
    return !this.indexStorage.hasIndex(workspaceFolder, index.getId());
  }
}

export default new IndexManager();
