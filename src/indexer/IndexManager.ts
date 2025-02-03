import { Progress, workspace } from 'vscode';
import { Indexer } from './Indexer';
import IndexStorage from 'common/IndexStorage';

export default class IndexManager {
  public constructor(private readonly indexers: Indexer[]) {}

  public getIndexers(): Indexer[] {
    return this.indexers;
  }

  public getIndexer<I extends Indexer>(name: string): I | undefined {
    return this.indexers.find(index => index.getName() === name) as I | undefined;
  }

  public async indexWorkspace(
    progress: Progress<{ message?: string; increment?: number }>,
    force: boolean = false
  ): Promise<void> {
    const workspaceUri = workspace.workspaceFolders![0].uri;

    for (const indexer of this.indexers) {
      if (!force && !this.shouldIndex(indexer)) {
        continue;
      }

      const files = await workspace.findFiles(indexer.getPattern(workspaceUri), 'dev/**');

      progress.report({ message: `Running indexer - ${indexer.getName()}`, increment: 0 });

      for (const file of files) {
        await indexer.indexFile(file);
      }

      const indexData = indexer.getData();
      IndexStorage.set(indexer.getId(), indexData);

      indexer.clear();

      progress.report({ increment: 100 });
    }
  }

  protected shouldIndex(index: Indexer): boolean {
    const indexData = IndexStorage.get(index.getId());

    if (!indexData) {
      return true;
    }

    return false;
  }
}
