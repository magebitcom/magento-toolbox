import { FileSystemWatcher, Progress, Uri, workspace, WorkspaceFolder } from 'vscode';
import { Indexer } from './Indexer';
import Common from 'util/Common';
import { minimatch } from 'minimatch';
import IndexStorage from './IndexStorage';
import { clear } from 'typescript-memoize';
import Logger from 'util/Logger';
import { IndexerKey } from 'types/indexer';
import { indexerDefinitions, IndexerDataMap } from './registry';

class IndexManager {
  private static readonly INDEX_BATCH_SIZE = 50;

  protected indexers: Indexer[] = [];
  protected indexStorage: IndexStorage;
  protected fileWatchers: Record<string, Record<IndexerKey, FileSystemWatcher>> = {};
  private readonly definitions = indexerDefinitions;

  public constructor() {
    const keys = this.definitions.map(def => def.key);
    if (new Set(keys).size !== keys.length) {
      throw new Error(`Duplicate indexer keys detected: ${keys.join(', ')}`);
    }

    this.indexers = this.definitions.map(def => def.createIndexer());
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
            if (!indexer.canIndex(file)) {
              return;
            }

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

    const definition = this.definitions.find(def => def.key === id);

    if (!definition) {
      return undefined;
    }

    return definition.createData(data) as IndexerDataMap[T];
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

  protected async removeFileFromIndex(
    workspaceFolder: WorkspaceFolder,
    file: Uri,
    indexer: Indexer
  ) {
    const indexData = this.getIndexStorageData(indexer.getId()) || new Map();
    indexData.delete(file.fsPath);
    this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);
    await this.indexStorage.saveIndex(workspaceFolder, indexer.getId(), indexer.getVersion());
  }

  protected shouldIndex(workspaceFolder: WorkspaceFolder, index: Indexer): boolean {
    return !this.indexStorage.hasIndex(workspaceFolder, index.getId());
  }

  public watchFiles(workspaceFolder: WorkspaceFolder) {
    Logger.logWithTime('Watching files for workspace', workspaceFolder.uri.fsPath);

    if (!this.fileWatchers[workspaceFolder.uri.fsPath]) {
      this.fileWatchers[workspaceFolder.uri.fsPath] = {};
    }

    for (const indexer of this.indexers) {
      const pattern = indexer.getPattern(workspaceFolder.uri);
      const patternString = typeof pattern === 'string' ? pattern : pattern.pattern;

      let watcher: FileSystemWatcher | undefined =
        this.fileWatchers[workspaceFolder.uri.fsPath][indexer.getId()];

      if (watcher) {
        watcher.dispose();
      }

      watcher = workspace.createFileSystemWatcher(patternString, false, false, false);

      watcher.onDidChange(file => {
        this.indexFileInner(workspaceFolder, file, indexer);

        Logger.logWithTime('File changed', file.fsPath);
      });

      watcher.onDidCreate(file => {
        this.indexFileInner(workspaceFolder, file, indexer);

        Logger.logWithTime('File created', file.fsPath);
      });

      watcher.onDidDelete(file => {
        this.removeFileFromIndex(workspaceFolder, file, indexer);

        Logger.logWithTime('File deleted', file.fsPath);
      });
    }
  }
}

export default new IndexManager();
