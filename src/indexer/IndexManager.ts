import {
  Disposable,
  Event,
  EventEmitter,
  FileType,
  Progress,
  RelativePattern,
  Uri,
  workspace,
  WorkspaceFolder,
} from 'vscode';
import { Indexer } from './Indexer';
import Common from 'util/Common';
import { minimatch } from 'minimatch';
import * as path from 'path';
import IndexStorage from './IndexStorage';
import { clear } from 'typescript-memoize';
import Logger from 'util/Logger';
import { IndexedFilePath, IndexerKey } from 'types/indexer';
import { indexerDefinitions, IndexerDataMap } from './registry';
import { IndexerDefinition, IndexerWatcherContext } from './IndexerDefinition';

export interface IndexChangeEvent {
  readonly indexerKeys: readonly IndexerKey[];
  readonly file?: Uri;
}

class IndexManager {
  private static readonly INDEX_BATCH_SIZE = 50;

  protected indexers: Indexer[] = [];
  protected indexStorage: IndexStorage;
  protected fileWatchers: Record<string, Record<IndexerKey, Disposable[]>> = {};
  // Cached derived index-data instances, keyed by workspace path then indexer key.
  // Reusing the instance keeps the per-instance memoization effective and avoids
  // allocating (and leaking) a fresh instance on every provider lookup.
  private readonly indexDataCache = new Map<string, Map<IndexerKey, unknown>>();
  private readonly definitions = indexerDefinitions;
  private readonly onDidIndexEmitter = new EventEmitter<IndexChangeEvent>();
  public readonly onDidIndex: Event<IndexChangeEvent> = this.onDidIndexEmitter.event;

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

      this.invalidateIndexData(workspaceFolder, indexer.getId());
      clear([indexer.getId()]);

      Logger.logWithTime('Indexing', indexer.getName(), 'done');

      progress.report({ increment: 100 });
    }

    Logger.logWithTime('Finished indexing workspace', workspaceFolder.name);

    this.onDidIndexEmitter.fire({ indexerKeys: this.indexers.map(i => i.getId()) });
  }

  public async indexFile(workspaceFolder: WorkspaceFolder, file: Uri): Promise<void> {
    Logger.logWithTime('Indexing file', file.fsPath);

    const changed = await Promise.all(
      this.indexers.map(indexer => this.indexFileInner(workspaceFolder, file, indexer))
    );

    await Promise.all(
      this.indexers
        .filter((_, i) => changed[i])
        .map(indexer => this.persistIndex(workspaceFolder, indexer))
    );

    Logger.logWithTime('Finished indexing file', file.fsPath);

    this.onDidIndexEmitter.fire({ indexerKeys: this.indexers.map(i => i.getId()), file });
  }

  public async indexFiles(workspaceFolder: WorkspaceFolder, files: Uri[]): Promise<void> {
    Logger.logWithTime(`Indexing ${files.length} files`);

    for (const indexer of this.indexers) {
      const results = await Promise.all(
        files.map(file => this.indexFileInner(workspaceFolder, file, indexer))
      );

      if (results.some(Boolean)) {
        await this.persistIndex(workspaceFolder, indexer);
      }
    }

    Logger.logWithTime(`Finished indexing ${files.length} files`);

    this.onDidIndexEmitter.fire({ indexerKeys: this.indexers.map(i => i.getId()) });
  }

  /**
   * Reconcile the index after a file or directory rename: drop stale entries for
   * the old path and (re-)index the new location.
   *
   * @param workspaceFolder The workspace the rename occurred in.
   * @param oldUri The pre-rename path (may be a directory).
   * @param newUri The post-rename path (may be a directory).
   */
  public async handleRename(
    workspaceFolder: WorkspaceFolder,
    oldUri: Uri,
    newUri: Uri
  ): Promise<void> {
    for (const indexer of this.indexers) {
      const indexData = this.getIndexStorageData(indexer.getId(), workspaceFolder);

      if (indexData && this.deleteByPathPrefix(indexData, oldUri.fsPath)) {
        this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);
        await this.persistIndex(workspaceFolder, indexer);
        this.invalidateIndexData(workspaceFolder, indexer.getId());
        clear([indexer.getId()]);
      }
    }

    let isDirectory = false;

    try {
      const stat = await workspace.fs.stat(newUri);
      isDirectory = stat.type === FileType.Directory;
    } catch {
      // New path no longer exists (e.g. moved out of the workspace); nothing to index.
      this.onDidIndexEmitter.fire({ indexerKeys: this.indexers.map(i => i.getId()) });
      return;
    }

    if (isDirectory) {
      const files = await workspace.findFiles(new RelativePattern(newUri, '**/*'));
      await this.indexFiles(workspaceFolder, files);
    } else {
      await this.indexFile(workspaceFolder, newUri);
    }
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
    const wf = workspaceFolder || Common.getActiveWorkspaceFolder();

    if (!wf) {
      return undefined;
    }

    const data = this.indexStorage.get(wf, id);

    if (!data) {
      return undefined;
    }

    let perWorkspace = this.indexDataCache.get(wf.uri.fsPath);

    if (!perWorkspace) {
      perWorkspace = new Map();
      this.indexDataCache.set(wf.uri.fsPath, perWorkspace);
    }

    const cached = perWorkspace.get(id);

    if (cached) {
      return cached as IndexerDataMap[T];
    }

    const definition = this.definitions.find(def => def.key === id);

    if (!definition) {
      return undefined;
    }

    const instance = definition.createData(data);
    perWorkspace.set(id, instance);

    return instance as IndexerDataMap[T];
  }

  protected async indexFileInner(
    workspaceFolder: WorkspaceFolder,
    file: Uri,
    indexer: Indexer
  ): Promise<boolean> {
    const pattern = indexer.getPattern(workspaceFolder.uri);
    const patternString = typeof pattern === 'string' ? pattern : pattern.pattern;

    if (!minimatch(file.fsPath, patternString, { matchBase: true })) {
      return false;
    }

    if (!indexer.canIndex(file)) {
      return false;
    }

    const indexData = this.getIndexStorageData(indexer.getId(), workspaceFolder) || new Map();
    const data = await indexer.indexFile(file);

    if (data !== undefined) {
      indexData.set(file.fsPath, data);
    } else if (indexData.has(file.fsPath)) {
      indexData.delete(file.fsPath);
    } else {
      return false;
    }

    this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);
    this.invalidateIndexData(workspaceFolder, indexer.getId());
    clear([indexer.getId()]);

    return true;
  }

  protected async removeFileFromIndex(
    workspaceFolder: WorkspaceFolder,
    file: Uri,
    indexer: Indexer
  ) {
    const indexData = this.getIndexStorageData(indexer.getId(), workspaceFolder);

    if (!indexData || !this.deleteByPathPrefix(indexData, file.fsPath)) {
      return;
    }

    this.indexStorage.set(workspaceFolder, indexer.getId(), indexData);
    await this.indexStorage.saveIndex(workspaceFolder, indexer.getId(), indexer.getVersion());

    this.invalidateIndexData(workspaceFolder, indexer.getId());
    clear([indexer.getId()]);
  }

  private async persistIndex(workspaceFolder: WorkspaceFolder, indexer: Indexer): Promise<void> {
    await this.indexStorage.saveIndex(workspaceFolder, indexer.getId(), indexer.getVersion());
  }

  private invalidateIndexData(workspaceFolder: WorkspaceFolder, key: IndexerKey): void {
    this.indexDataCache.get(workspaceFolder.uri.fsPath)?.delete(key);
  }

  /**
   * Delete the entry for an exact path plus any entry nested beneath it, so a
   * directory delete/rename removes every descendant index entry.
   *
   * @param indexData The index map to mutate in place.
   * @param fsPath The file or directory path to remove.
   * @returns Whether any entry was removed.
   */
  private deleteByPathPrefix(indexData: Map<string, unknown>, fsPath: string): boolean {
    const prefix = fsPath + path.sep;
    let removed = false;

    for (const key of [...indexData.keys()]) {
      if (key === fsPath || key.startsWith(prefix)) {
        indexData.delete(key);
        removed = true;
      }
    }

    return removed;
  }

  protected shouldIndex(workspaceFolder: WorkspaceFolder, index: Indexer): boolean {
    return !this.indexStorage.hasIndex(workspaceFolder, index.getId());
  }

  public watchFiles(workspaceFolder: WorkspaceFolder) {
    Logger.logWithTime('Watching files for workspace', workspaceFolder.uri.fsPath);

    if (!this.fileWatchers[workspaceFolder.uri.fsPath]) {
      this.fileWatchers[workspaceFolder.uri.fsPath] = {};
    }

    for (let i = 0; i < this.indexers.length; i++) {
      const indexer = this.indexers[i];
      const definition = this.definitions[i];
      const pattern = indexer.getPattern(workspaceFolder.uri);
      const patternString = typeof pattern === 'string' ? pattern : pattern.pattern;

      const existing = this.fileWatchers[workspaceFolder.uri.fsPath][indexer.getId()];
      if (existing) {
        for (const disposable of existing) {
          disposable.dispose();
        }
      }

      const watcher = workspace.createFileSystemWatcher(patternString, false, false, false);

      watcher.onDidChange(async file => {
        if (await this.indexFileInner(workspaceFolder, file, indexer)) {
          await this.persistIndex(workspaceFolder, indexer);
          this.onDidIndexEmitter.fire({ indexerKeys: [indexer.getId()], file });
        }

        Logger.logWithTime('File changed', file.fsPath);
      });

      watcher.onDidCreate(async file => {
        if (await this.indexFileInner(workspaceFolder, file, indexer)) {
          await this.persistIndex(workspaceFolder, indexer);
          this.onDidIndexEmitter.fire({ indexerKeys: [indexer.getId()], file });
        }

        Logger.logWithTime('File created', file.fsPath);
      });

      watcher.onDidDelete(async file => {
        await this.removeFileFromIndex(workspaceFolder, file, indexer);
        this.onDidIndexEmitter.fire({ indexerKeys: [indexer.getId()], file });

        Logger.logWithTime('File deleted', file.fsPath);
      });

      const disposables: Disposable[] = [watcher];

      if (definition.watchAdditional) {
        const additional = definition.watchAdditional(
          this.buildWatcherContext(workspaceFolder, indexer, definition)
        );
        disposables.push(...additional);
      }

      this.fileWatchers[workspaceFolder.uri.fsPath][indexer.getId()] = disposables;
    }
  }

  private buildWatcherContext(
    workspaceFolder: WorkspaceFolder,
    indexer: Indexer,
    definition: IndexerDefinition
  ): IndexerWatcherContext {
    return {
      workspaceFolder,
      key: definition.key,
      indexer,
      getData: () => {
        const data = this.indexStorage.get(workspaceFolder, definition.key);
        if (data) {
          return data;
        }
        const empty = new Map<IndexedFilePath, any>();
        this.indexStorage.set(workspaceFolder, definition.key, empty);
        return empty;
      },
      commit: async data => {
        this.indexStorage.set(workspaceFolder, definition.key, data);
        await this.indexStorage.saveIndex(workspaceFolder, definition.key, indexer.getVersion());
        this.invalidateIndexData(workspaceFolder, definition.key);
        clear([definition.key]);
      },
    };
  }
}

export default new IndexManager();
