import * as assert from 'assert';
import * as path from 'path';
import { describe, it } from 'mocha';
import IndexManager from 'indexer/IndexManager';

// `deleteByPathPrefix` is a private helper underpinning rename/delete handling;
// an off-by-one on the separator would orphan or over-delete index entries.
const deleteByPathPrefix = (indexData: Map<string, unknown>, fsPath: string): boolean =>
  (
    IndexManager as unknown as {
      deleteByPathPrefix(indexData: Map<string, unknown>, fsPath: string): boolean;
    }
  ).deleteByPathPrefix(indexData, fsPath);

describe('IndexManager.deleteByPathPrefix Tests', () => {
  it('should remove an exact file match and report removal', () => {
    const file = path.join('/ws', 'app', 'a.xml');
    const map = new Map<string, unknown>([[file, 1]]);

    assert.strictEqual(deleteByPathPrefix(map, file), true);
    assert.strictEqual(map.has(file), false);
  });

  it('should remove every descendant when a directory is removed', () => {
    const dir = path.join('/ws', 'app', 'Foo');
    const child = path.join(dir, 'etc', 'di.xml');
    const grandchild = path.join(dir, 'view', 'frontend', 'layout', 'a.xml');
    const outside = path.join('/ws', 'app', 'Bar', 'etc', 'di.xml');
    const map = new Map<string, unknown>([
      [child, 1],
      [grandchild, 2],
      [outside, 3],
    ]);

    assert.strictEqual(deleteByPathPrefix(map, dir), true);
    assert.strictEqual(map.has(child), false);
    assert.strictEqual(map.has(grandchild), false);
    assert.strictEqual(map.has(outside), true);
  });

  it('should not delete sibling paths that merely share a string prefix', () => {
    const dir = path.join('/ws', 'app', 'Foo');
    const sibling = path.join('/ws', 'app', 'FooBar', 'etc', 'di.xml');
    const map = new Map<string, unknown>([[sibling, 1]]);

    assert.strictEqual(deleteByPathPrefix(map, dir), false);
    assert.strictEqual(map.has(sibling), true);
  });

  it('should return false when nothing matches', () => {
    const map = new Map<string, unknown>([[path.join('/ws', 'a.xml'), 1]]);

    assert.strictEqual(deleteByPathPrefix(map, path.join('/ws', 'b.xml')), false);
    assert.strictEqual(map.size, 1);
  });

  it('should return false for an empty map', () => {
    assert.strictEqual(deleteByPathPrefix(new Map(), path.join('/ws', 'a.xml')), false);
  });
});
