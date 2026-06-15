import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { describe, it, before, after } from 'mocha';
import { workspace } from 'vscode';
import { findVirtualTypeRange } from 'definition/util/findVirtualTypeRange';

const DI_XML = [
  '<?xml version="1.0"?>',
  '<config>',
  '    <virtualType name="Foo\\Bar\\FirstVirtual" type="Foo\\Bar\\Real" />',
  '    <virtualType name="Foo\\Bar\\SecondVirtual" type="Foo\\Bar\\Other" />',
  '</config>',
  '',
].join('\n');

describe('findVirtualTypeRange Tests', () => {
  let diPath: string;

  before(() => {
    diPath = path.join(os.tmpdir(), `mt-virtualtype-${process.pid}-di.xml`);
    fs.writeFileSync(diPath, DI_XML, 'utf8');
  });

  after(() => {
    fs.rmSync(diPath, { force: true });
  });

  it('should return a range that exactly covers the requested virtualType name', async () => {
    const result = await findVirtualTypeRange(diPath, 'Foo\\Bar\\FirstVirtual');

    assert.ok(result, 'expected a match');
    const document = await workspace.openTextDocument(result!.uri);
    assert.strictEqual(document.getText(result!.range), 'Foo\\Bar\\FirstVirtual');
    assert.strictEqual(result!.range.start.line, 2);
  });

  it('should resolve the correct entry when multiple virtualTypes exist', async () => {
    const result = await findVirtualTypeRange(diPath, 'Foo\\Bar\\SecondVirtual');

    assert.ok(result, 'expected a match');
    const document = await workspace.openTextDocument(result!.uri);
    assert.strictEqual(document.getText(result!.range), 'Foo\\Bar\\SecondVirtual');
    assert.strictEqual(result!.range.start.line, 3);
  });

  it('should return undefined when the name is not present', async () => {
    const result = await findVirtualTypeRange(diPath, 'Foo\\Bar\\Missing');

    assert.strictEqual(result, undefined);
  });
});
