import * as assert from 'assert';
import { describe, it } from 'mocha';
import { TextDocument } from 'vscode';
import DocumentCache from 'cache/DocumentCache';

function fakeDocument(fsPath: string, version: number): TextDocument {
  return { uri: { fsPath }, version } as unknown as TextDocument;
}

describe('DocumentCache Tests', () => {
  it('should return a cached value when the document version matches', () => {
    const doc = fakeDocument('/ws/a.xml', 1);
    DocumentCache.set(doc, 'ast', { nodes: 3 });

    assert.deepStrictEqual(DocumentCache.get(doc, 'ast'), { nodes: 3 });
    assert.strictEqual(DocumentCache.has(doc, 'ast'), true);
  });

  it('should miss when the document version has advanced', () => {
    const v1 = fakeDocument('/ws/b.xml', 1);
    DocumentCache.set(v1, 'ast', { nodes: 3 });

    const v2 = fakeDocument('/ws/b.xml', 2);
    assert.strictEqual(DocumentCache.get(v2, 'ast'), undefined);
    assert.strictEqual(DocumentCache.has(v2, 'ast'), false);
  });

  it('should return undefined for an unknown key', () => {
    const doc = fakeDocument('/ws/c.xml', 1);
    assert.strictEqual(DocumentCache.get(doc, 'missing'), undefined);
    assert.strictEqual(DocumentCache.has(doc, 'missing'), false);
  });

  it('should keep entries for different paths isolated', () => {
    const a = fakeDocument('/ws/d.xml', 1);
    const b = fakeDocument('/ws/e.xml', 1);
    DocumentCache.set(a, 'ast', 'value-a');
    DocumentCache.set(b, 'ast', 'value-b');

    assert.strictEqual(DocumentCache.get(a, 'ast'), 'value-a');
    assert.strictEqual(DocumentCache.get(b, 'ast'), 'value-b');
  });

  it('should keep entries for different keys on the same document isolated', () => {
    const doc = fakeDocument('/ws/f.xml', 1);
    DocumentCache.set(doc, 'ast', 'ast-value');
    DocumentCache.set(doc, 'symbols', 'symbols-value');

    assert.strictEqual(DocumentCache.get(doc, 'ast'), 'ast-value');
    assert.strictEqual(DocumentCache.get(doc, 'symbols'), 'symbols-value');
  });

  it('should delete a single entry', () => {
    const doc = fakeDocument('/ws/g.xml', 1);
    DocumentCache.set(doc, 'ast', 'value');
    DocumentCache.delete(doc, 'ast');

    assert.strictEqual(DocumentCache.get(doc, 'ast'), undefined);
  });

  it('should clear every key for a document by path prefix', () => {
    const doc = fakeDocument('/ws/h.xml', 1);
    DocumentCache.set(doc, 'ast', 'a');
    DocumentCache.set(doc, 'symbols', 'b');

    DocumentCache.clear(doc);

    assert.strictEqual(DocumentCache.get(doc, 'ast'), undefined);
    assert.strictEqual(DocumentCache.get(doc, 'symbols'), undefined);
  });

  it('should not clear a path that merely shares a prefix string', () => {
    const target = fakeDocument('/ws/i.xml', 1);
    const sibling = fakeDocument('/ws/i.xml.bak', 1);
    DocumentCache.set(target, 'ast', 'target');
    DocumentCache.set(sibling, 'ast', 'sibling');

    DocumentCache.clear(target);

    assert.strictEqual(DocumentCache.get(target, 'ast'), undefined);
    assert.strictEqual(DocumentCache.get(sibling, 'ast'), 'sibling');
  });
});
