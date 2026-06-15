import * as assert from 'assert';
import { describe, it } from 'mocha';
import { IndexDataSerializer } from 'indexer/IndexDataSerializer';
import { SavedIndex } from 'types/indexer';

describe('IndexDataSerializer Tests', () => {
  const serializer = new IndexDataSerializer();

  it('should round-trip the data Map preserving entries', () => {
    const saved: SavedIndex = {
      version: 1,
      data: new Map<string, number>([
        ['/a.xml', 1],
        ['/b.xml', 2],
      ]),
    };

    const result = serializer.deserialize(serializer.serialize(saved));

    assert.strictEqual(result.version, 1);
    assert.ok(result.data instanceof Map);
    assert.strictEqual(result.data.get('/a.xml'), 1);
    assert.strictEqual(result.data.get('/b.xml'), 2);
    assert.strictEqual(result.data.size, 2);
  });

  it('should round-trip an empty Map', () => {
    const saved: SavedIndex = { version: 3, data: new Map() };

    const result = serializer.deserialize(serializer.serialize(saved));

    assert.ok(result.data instanceof Map);
    assert.strictEqual(result.data.size, 0);
  });

  it('should preserve nested object values stored in the Map', () => {
    const value = { class: 'Foo\\Bar', methods: ['execute'] };
    const saved: SavedIndex = {
      version: 2,
      data: new Map([['/etc/di.xml', value]]),
    };

    const result = serializer.deserialize(serializer.serialize(saved));

    assert.deepStrictEqual(result.data.get('/etc/di.xml'), value);
  });

  it('should preserve the version field as a number', () => {
    const saved: SavedIndex = { version: 42, data: new Map() };

    const result = serializer.deserialize(serializer.serialize(saved));

    assert.strictEqual(result.version, 42);
    assert.strictEqual(typeof result.version, 'number');
  });

  it('should serialize a Map to the tagged envelope shape', () => {
    const saved: SavedIndex = { version: 1, data: new Map([['k', 'v']]) };

    const raw = JSON.parse(serializer.serialize(saved));

    assert.strictEqual(raw.data.__type, 'Map');
    assert.deepStrictEqual(raw.data.value, [['k', 'v']]);
  });
});
