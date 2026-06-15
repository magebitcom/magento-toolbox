import * as assert from 'assert';
import { describe, it } from 'mocha';
import Range from 'util/Range';

describe('Range.fileRegexToVsCodeRange Tests', () => {
  it('should map a single-line match to the correct range', () => {
    const range = Range.fileRegexToVsCodeRange(/world/, 'line0\nhello world\nfoo');

    assert.strictEqual(range.start.line, 1);
    assert.strictEqual(range.start.character, 6);
    assert.strictEqual(range.end.line, 1);
    assert.strictEqual(range.end.character, 11);
  });

  it('should target the first capture group when present', () => {
    const range = Range.fileRegexToVsCodeRange(/name="([^"]*)"/, '<a name="Foo" />');

    // Range should cover just "Foo", not the whole attribute.
    assert.strictEqual(range.start.line, 0);
    assert.strictEqual(range.start.character, 9);
    assert.strictEqual(range.end.character, 12);
  });

  it('should span a multi-line match across lines', () => {
    const range = Range.fileRegexToVsCodeRange(/a\nb\nc/, 'x\na\nb\nc\ny');

    assert.strictEqual(range.start.line, 1);
    assert.strictEqual(range.start.character, 0);
    assert.strictEqual(range.end.line, 3);
    assert.strictEqual(range.end.character, 1);
  });

  it('should return a zero range when there is no match', () => {
    const range = Range.fileRegexToVsCodeRange(/xyz/, 'abc');

    assert.strictEqual(range.start.line, 0);
    assert.strictEqual(range.start.character, 0);
    assert.strictEqual(range.end.line, 0);
    assert.strictEqual(range.end.character, 0);
  });

  it('should return every match for a global pattern', () => {
    const ranges = Range.fileRegexToVsCodeRanges(/a/g, 'a\na\na');

    assert.strictEqual(ranges.length, 3);
    assert.deepStrictEqual(
      ranges.map(r => r.start.line),
      [0, 1, 2]
    );
  });

  it('should not loop forever on a zero-width match', () => {
    const ranges = Range.fileRegexToVsCodeRanges(/(?=b)/g, 'abab');

    assert.strictEqual(ranges.length, 2);
  });
});
