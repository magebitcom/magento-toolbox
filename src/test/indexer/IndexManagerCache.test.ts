import * as assert from 'assert';
import { describe, it, before } from 'mocha';
import { Uri, WorkspaceFolder } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { setup } from 'test/setup';

interface IndexManagerInternals {
  indexStorage: { set(wf: WorkspaceFolder, key: string, value: Map<string, unknown>): void };
  invalidateIndexData(wf: WorkspaceFolder, key: string): void;
}

const internals = IndexManager as unknown as IndexManagerInternals;

function fakeWorkspace(fsPath: string): WorkspaceFolder {
  return { uri: Uri.file(fsPath), name: fsPath, index: 0 };
}

describe('IndexManager.getIndexData cache Tests', () => {
  before(async () => {
    await setup();
  });

  it('should return undefined when no index data is stored', () => {
    const wf = fakeWorkspace('/tmp/mt-cache-none');

    assert.strictEqual(IndexManager.getIndexData(ModuleIndexer.KEY, wf), undefined);
  });

  it('should reuse the same derived data instance across calls', () => {
    const wf = fakeWorkspace('/tmp/mt-cache-reuse');
    internals.indexStorage.set(wf, ModuleIndexer.KEY, new Map());

    const first = IndexManager.getIndexData(ModuleIndexer.KEY, wf);
    const second = IndexManager.getIndexData(ModuleIndexer.KEY, wf);

    assert.ok(first);
    assert.strictEqual(first, second);
  });

  it('should keep separate instances per workspace', () => {
    const wfA = fakeWorkspace('/tmp/mt-cache-a');
    const wfB = fakeWorkspace('/tmp/mt-cache-b');
    internals.indexStorage.set(wfA, ModuleIndexer.KEY, new Map());
    internals.indexStorage.set(wfB, ModuleIndexer.KEY, new Map());

    const a = IndexManager.getIndexData(ModuleIndexer.KEY, wfA);
    const b = IndexManager.getIndexData(ModuleIndexer.KEY, wfB);

    assert.ok(a && b);
    assert.notStrictEqual(a, b);
  });

  it('should build a fresh instance after invalidation', () => {
    const wf = fakeWorkspace('/tmp/mt-cache-invalidate');
    internals.indexStorage.set(wf, ModuleIndexer.KEY, new Map());

    const first = IndexManager.getIndexData(ModuleIndexer.KEY, wf);
    internals.invalidateIndexData(wf, ModuleIndexer.KEY);
    const second = IndexManager.getIndexData(ModuleIndexer.KEY, wf);

    assert.ok(first && second);
    assert.notStrictEqual(first, second);
  });
});
