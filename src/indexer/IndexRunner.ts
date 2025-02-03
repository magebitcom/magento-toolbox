import * as vscode from 'vscode';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import DiIndexer from './DiIndexer';
import IndexManager from './IndexManager';
import ModuleIndexer from './ModuleIndexer';

export default class IndexRunner {
  private static instance: IndexRunner;

  private indexManager: IndexManager;

  private constructor() {
    this.indexManager = new IndexManager([
      new ModuleIndexer(),
      new AutoloadNamespaceIndexer(),
      new DiIndexer(),
    ]);
  }

  public static getInstance(): IndexRunner {
    if (!IndexRunner.instance) {
      IndexRunner.instance = new IndexRunner();
    }

    return IndexRunner.instance;
  }

  public async indexWorkspace(): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: '[Magento Toolbox]',
      },
      async progress => {
        await this.indexManager.indexWorkspace(progress);
      }
    );
  }
}
