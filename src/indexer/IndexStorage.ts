import { WorkspaceFolder, Uri, workspace } from 'vscode';
import { IndexerKey, IndexerStorage, IndexedFilePath, SavedIndex } from 'types/indexer';
import { IndexDataSerializer } from './IndexDataSerializer';
import ExtensionState from 'common/ExtensionState';
import * as path from 'path';
import Logger from 'util/Logger';

export default class IndexStorage {
  private _indexStorage: IndexerStorage = {};
  private serializer = new IndexDataSerializer();

  public set(workspaceFolder: WorkspaceFolder, key: IndexerKey, value: Map<IndexedFilePath, any>) {
    if (!this._indexStorage[workspaceFolder.uri.fsPath]) {
      this._indexStorage[workspaceFolder.uri.fsPath] = {};
    }

    this._indexStorage[workspaceFolder.uri.fsPath][key] = value;
  }

  public get<T = any>(
    workspaceFolder: WorkspaceFolder,
    key: IndexerKey
  ): Map<IndexedFilePath, T> | undefined {
    return this._indexStorage[workspaceFolder.uri.fsPath]?.[key];
  }

  public clear() {
    this._indexStorage = {};
  }

  public hasIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey) {
    return !!this._indexStorage[workspaceFolder.uri.fsPath]?.[key];
  }

  public async saveIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey, version: number) {
    const indexData = this._indexStorage[workspaceFolder.uri.fsPath][key];

    const savedIndex: SavedIndex = {
      version,
      data: indexData,
    };
    const serialized = this.serializer.serialize(savedIndex);

    const storageUri = this.getStorageUri();
    const indexFileUri = this.getIndexFileUri(storageUri, workspaceFolder, key);

    // Ensure the storage directory exists
    await this.ensureStorageDirectoryExists(storageUri);

    // Write the index data to disk
    await workspace.fs.writeFile(indexFileUri, Buffer.from(serialized, 'utf8'));
  }

  public async loadIndex(workspaceFolder: WorkspaceFolder, key: IndexerKey, version: number) {
    let serialized: string | undefined;

    try {
      const storageUri = this.getStorageUri();
      const indexFileUri = this.getIndexFileUri(storageUri, workspaceFolder, key);

      const fileData = await workspace.fs.readFile(indexFileUri);
      serialized = fileData.toString();
    } catch (error) {
      Logger.logWithTime('Failed to load index', workspaceFolder.name, key, String(error));
    }

    if (!serialized) {
      return undefined;
    }

    try {
      const savedIndex = this.serializer.deserialize(serialized);

      if (savedIndex.version !== version) {
        return undefined;
      }

      if (!this._indexStorage[workspaceFolder.uri.fsPath]) {
        this._indexStorage[workspaceFolder.uri.fsPath] = {};
      }

      this._indexStorage[workspaceFolder.uri.fsPath][key] = savedIndex.data;
    } catch (error) {
      console.error(
        `Failed to deserialize index ${key} for workspace ${workspaceFolder.name}:`,
        error
      );
      return undefined;
    }
  }

  private getStorageUri(): Uri {
    const storageUri = ExtensionState.context.storageUri;
    if (!storageUri) {
      throw new Error('Extension storage URI is not available');
    }
    return storageUri;
  }

  private getIndexFileUri(storageUri: Uri, workspaceFolder: WorkspaceFolder, key: IndexerKey): Uri {
    const workspaceName = path.basename(workspaceFolder.uri.fsPath);
    const workspaceHash = this.createHash(workspaceFolder.uri.fsPath);
    const filename = `index-${workspaceName}-${workspaceHash}-${key}.json`;
    return Uri.joinPath(storageUri, 'indexes', filename);
  }

  private async ensureStorageDirectoryExists(storageUri: Uri): Promise<void> {
    const indexesDir = Uri.joinPath(storageUri, 'indexes');
    try {
      await workspace.fs.createDirectory(indexesDir);
    } catch (error) {
      // Directory might already exist, which is fine
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'FileExists') {
        throw error;
      }
    }
  }

  private createHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
