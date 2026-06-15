import * as assert from 'assert';
import { describe, it } from 'mocha';
import MagentoCli from 'common/MagentoCli';

// `quote` is a private static helper; it is the shell-injection defence for every
// command MagentoCli runs, so it is tested directly via a cast.
const quote = (value: string): string =>
  (MagentoCli as unknown as { quote(value: string): string }).quote(value);

describe('MagentoCli.quote Tests', () => {
  it('should wrap a plain token in single quotes', () => {
    assert.strictEqual(quote('setup:upgrade'), `'setup:upgrade'`);
  });

  it('should quote an empty string as an empty quoted token', () => {
    assert.strictEqual(quote(''), `''`);
  });

  it('should keep spaces safe inside the quotes', () => {
    assert.strictEqual(quote('a b c'), `'a b c'`);
  });

  it('should escape a single quote using the POSIX close-escape-reopen sequence', () => {
    assert.strictEqual(quote(`it's`), `'it'\\''s'`);
  });

  it('should escape multiple consecutive single quotes', () => {
    assert.strictEqual(quote(`'''`), `''\\'''\\'''\\'''`);
  });

  it('should not expand command substitution, backticks or variables', () => {
    assert.strictEqual(quote('$(whoami)'), `'$(whoami)'`);
    assert.strictEqual(quote('`id`'), "'`id`'");
    assert.strictEqual(quote('$HOME'), `'$HOME'`);
  });

  it('should keep command separators inert', () => {
    assert.strictEqual(quote('; rm -rf /'), `'; rm -rf /'`);
    assert.strictEqual(quote('foo && bar'), `'foo && bar'`);
    assert.strictEqual(quote('a | b'), `'a | b'`);
  });

  it('should neutralise an injection payload that breaks out with a quote', () => {
    const payload = `'; rm -rf /; echo '`;
    const quoted = quote(payload);

    // The result must be a single shell token: it starts and ends with a quote,
    // and every embedded quote is the escaped `'\''` sequence so nothing breaks out.
    assert.ok(quoted.startsWith(`'`));
    assert.ok(quoted.endsWith(`'`));
    assert.strictEqual(quoted.replace(/'\\''/g, ''), `'; rm -rf /; echo '`);
  });

  it('should preserve newlines inside the quoted token', () => {
    assert.strictEqual(quote('line1\nline2'), `'line1\nline2'`);
  });
});
