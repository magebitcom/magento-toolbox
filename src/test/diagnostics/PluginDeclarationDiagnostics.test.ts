import * as assert from 'assert';
import { describe, it } from 'mocha';
import PluginDeclarationDiagnostics from 'diagnostics/xml/PluginDeclarationDiagnostics';

interface PluginInternals {
  getScopeFromPath(fsPath: string): string;
  scopesConflict(a: string, b: string): boolean;
}

const internals = (): PluginInternals =>
  new PluginDeclarationDiagnostics() as unknown as PluginInternals;

describe('PluginDeclarationDiagnostics internals Tests', () => {
  describe('getScopeFromPath', () => {
    it('should extract the area segment from an area-scoped di.xml', () => {
      assert.strictEqual(
        internals().getScopeFromPath('/app/code/Foo/Bar/etc/frontend/di.xml'),
        'frontend'
      );
    });

    it('should treat a top-level etc/di.xml as global', () => {
      assert.strictEqual(internals().getScopeFromPath('/app/code/Foo/Bar/etc/di.xml'), 'global');
    });

    it('should normalise Windows separators', () => {
      assert.strictEqual(
        internals().getScopeFromPath('C:\\app\\code\\Foo\\Bar\\etc\\adminhtml\\di.xml'),
        'adminhtml'
      );
    });

    it('should fall back to global for an unrelated path', () => {
      assert.strictEqual(internals().getScopeFromPath('/some/other/file.xml'), 'global');
    });
  });

  describe('scopesConflict', () => {
    it('should conflict when both scopes are equal', () => {
      assert.strictEqual(internals().scopesConflict('frontend', 'frontend'), true);
    });

    it('should conflict when either scope is global', () => {
      assert.strictEqual(internals().scopesConflict('global', 'frontend'), true);
      assert.strictEqual(internals().scopesConflict('frontend', 'global'), true);
    });

    it('should not conflict between two distinct area scopes', () => {
      assert.strictEqual(internals().scopesConflict('frontend', 'adminhtml'), false);
    });
  });
});
