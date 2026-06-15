import * as assert from 'assert';
import { describe, it } from 'mocha';
import PhpNamespace from 'common/PhpNamespace';

describe('PhpNamespace Tests', () => {
  describe('fromString', () => {
    it('should split a namespace into parts', () => {
      assert.deepStrictEqual(PhpNamespace.fromString('Vendor\\Module\\Model').getParts(), [
        'Vendor',
        'Module',
        'Model',
      ]);
    });

    it('should trim a leading separator', () => {
      assert.deepStrictEqual(PhpNamespace.fromString('\\Vendor\\Module').getParts(), [
        'Vendor',
        'Module',
      ]);
    });

    it('should drop empty parts from doubled separators', () => {
      assert.deepStrictEqual(PhpNamespace.fromString('Vendor\\\\Module').getParts(), [
        'Vendor',
        'Module',
      ]);
    });

    it('should round-trip through toString', () => {
      assert.strictEqual(
        PhpNamespace.fromString('Vendor\\Module\\Model').toString(),
        'Vendor\\Module\\Model'
      );
    });
  });

  describe('head / tail / pop', () => {
    it('should expose the head and tail parts', () => {
      const ns = PhpNamespace.fromParts(['Vendor', 'Module', 'Model']);
      assert.strictEqual(ns.getHead(), 'Vendor');
      assert.strictEqual(ns.getTail(), 'Model');
    });

    it('should pop the last part', () => {
      const ns = PhpNamespace.fromParts(['Vendor', 'Module', 'Model']);
      assert.strictEqual(ns.pop(), 'Model');
      assert.deepStrictEqual(ns.getParts(), ['Vendor', 'Module']);
    });
  });

  describe('append', () => {
    it('should append string parts', () => {
      assert.strictEqual(
        PhpNamespace.fromParts(['Vendor', 'Module']).append('Model', 'Product').toString(),
        'Vendor\\Module\\Model\\Product'
      );
    });

    it('should append another namespace by flattening its parts', () => {
      const base = PhpNamespace.fromParts(['Vendor', 'Module']);
      const tail = PhpNamespace.fromParts(['Model', 'Product']);
      assert.strictEqual(base.append(tail).toString(), 'Vendor\\Module\\Model\\Product');
    });

    it('should not mutate the original namespace', () => {
      const base = PhpNamespace.fromParts(['Vendor', 'Module']);
      base.append('Model');
      assert.deepStrictEqual(base.getParts(), ['Vendor', 'Module']);
    });
  });

  describe('prepend', () => {
    it('should prepend a string part', () => {
      assert.strictEqual(
        PhpNamespace.fromParts(['Module', 'Model']).prepend('Vendor').toString(),
        'Vendor\\Module\\Model'
      );
    });

    it('should prepend another namespace', () => {
      const ns = PhpNamespace.fromParts(['Model']);
      const prefix = PhpNamespace.fromParts(['Vendor', 'Module']);
      assert.strictEqual(ns.prepend(prefix).toString(), 'Vendor\\Module\\Model');
    });
  });

  describe('isSubNamespaceOf', () => {
    it('should return true for a deeper namespace', () => {
      const child = PhpNamespace.fromString('Vendor\\Module\\Model\\Product');
      const parent = PhpNamespace.fromString('Vendor\\Module');
      assert.strictEqual(child.isSubNamespaceOf(parent), true);
    });

    it('should return true for an equal namespace', () => {
      const a = PhpNamespace.fromString('Vendor\\Module');
      const b = PhpNamespace.fromString('Vendor\\Module');
      assert.strictEqual(a.isSubNamespaceOf(b), true);
    });

    it('should return false for a shallower namespace', () => {
      const parent = PhpNamespace.fromString('Vendor\\Module');
      const child = PhpNamespace.fromString('Vendor\\Module\\Model');
      assert.strictEqual(parent.isSubNamespaceOf(child), false);
    });

    it('should return false for a sibling namespace', () => {
      const a = PhpNamespace.fromString('Vendor\\Other\\Model');
      const b = PhpNamespace.fromString('Vendor\\Module');
      assert.strictEqual(a.isSubNamespaceOf(b), false);
    });
  });
});
