import * as assert from 'assert';
import { describe, it } from 'mocha';
import Magento from 'util/Magento';
import { MagentoScope } from 'types/global';

describe('Magento Tests', () => {
  describe('isPluginMethod', () => {
    ['aroundExecute', 'beforeSave', 'afterGetName'].forEach(method => {
      it(`should detect "${method}" as a plugin method`, () => {
        assert.strictEqual(Magento.isPluginMethod(method), true);
      });
    });

    ['execute', 'getName', 'AroundExecute', 'Before', ''].forEach(method => {
      it(`should not detect "${method}" as a plugin method`, () => {
        assert.strictEqual(Magento.isPluginMethod(method), false);
      });
    });
  });

  describe('pluginMethodToMethodName', () => {
    const cases: [string, string][] = [
      ['aroundExecute', 'execute'],
      ['beforeSave', 'save'],
      ['afterGetName', 'getName'],
    ];

    cases.forEach(([input, expected]) => {
      it(`should map "${input}" to "${expected}"`, () => {
        assert.strictEqual(Magento.pluginMethodToMethodName(input), expected);
      });
    });
  });

  describe('splitModule / getModuleName', () => {
    it('should split a module name into vendor and module', () => {
      assert.deepStrictEqual(Magento.splitModule('Vendor_Module'), {
        vendor: 'Vendor',
        module: 'Module',
      });
    });

    it('should rebuild a module name from vendor and module', () => {
      assert.strictEqual(Magento.getModuleName('Vendor', 'Module'), 'Vendor_Module');
    });

    it('should round-trip split and rebuild', () => {
      const { vendor, module } = Magento.splitModule('Foo_Bar');
      assert.strictEqual(Magento.getModuleName(vendor, module), 'Foo_Bar');
    });
  });

  describe('getArea', () => {
    it('should detect the frontend area', () => {
      assert.strictEqual(Magento.getArea('/ws/view/frontend/layout/a.xml'), MagentoScope.Frontend);
    });

    it('should detect the adminhtml area', () => {
      assert.strictEqual(
        Magento.getArea('/ws/view/adminhtml/layout/a.xml'),
        MagentoScope.Adminhtml
      );
    });

    it('should fall back to the global area', () => {
      assert.strictEqual(Magento.getArea('/ws/etc/di.xml'), MagentoScope.Global);
    });
  });

  describe('getLayoutArea', () => {
    it('should detect frontend from a module view path', () => {
      assert.strictEqual(
        Magento.getLayoutArea('/ws/view/frontend/layout/a.xml'),
        MagentoScope.Frontend
      );
    });

    it('should detect adminhtml from a theme design path', () => {
      assert.strictEqual(
        Magento.getLayoutArea('/ws/app/design/adminhtml/Vendor/theme/a.xml'),
        MagentoScope.Adminhtml
      );
    });

    it('should normalise Windows separators', () => {
      assert.strictEqual(
        Magento.getLayoutArea('C:\\ws\\view\\frontend\\layout\\a.xml'),
        MagentoScope.Frontend
      );
    });

    it('should fall back to the base area', () => {
      assert.strictEqual(Magento.getLayoutArea('/ws/view/base/layout/a.xml'), MagentoScope.Base);
    });
  });
});
