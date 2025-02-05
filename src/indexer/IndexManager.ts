import { Progress, workspace } from 'vscode';
import { Indexer } from './Indexer';
import IndexStorage from 'common/IndexStorage';
import Common from 'util/Common';

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

    Common.startStopwatch('indexWorkspace');

    for (const indexer of this.indexers) {
      if (!force && !this.shouldIndex(indexer)) {
        continue;
      }

      const timer = `indexer_${indexer.getId()}`;
      Common.startStopwatch(timer);
      const files = await workspace.findFiles(indexer.getPattern(workspaceUri), 'dev/**');

      progress.report({ message: `Running indexer - ${indexer.getName()}`, increment: 0 });

      const promises = files.map(file => indexer.indexFile(file));
      await Promise.all(promises);

      const indexData = indexer.getData();
      IndexStorage.set(indexer.getId(), indexData);

      indexer.clear();
      Common.stopStopwatch(timer);

      progress.report({ increment: 100 });
    }

    Common.stopStopwatch('indexWorkspace');
  }

  protected shouldIndex(index: Indexer): boolean {
    const indexData = IndexStorage.get(index.getId());

    if (!indexData) {
      return true;
    }

    return false;
  }
}
