import * as assert from 'assert';
import { describe, it } from 'mocha';
import Validation from 'common/Validation';

describe('Validation Tests', () => {
  describe('isValidModuleName', () => {
    ['Vendor_Module', 'Foo_Bar', 'Magento_Catalog', 'A1_B2'].forEach(name => {
      it(`should accept "${name}"`, () => {
        assert.strictEqual(Validation.isValidModuleName(name).isValid, true);
      });
    });

    [
      'vendor_module',
      'Vendor',
      'Vendor_',
      '_Module',
      'Vendor__Module',
      'Vendor_module',
      '',
    ].forEach(name => {
      it(`should reject "${name}"`, () => {
        const result = Validation.isValidModuleName(name);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.errors && result.errors.length > 0);
      });
    });
  });

  describe('isValidClassName', () => {
    ['ClassName', '_Class', 'classNAME', 'Class123'].forEach(name => {
      it(`should accept "${name}"`, () => {
        assert.strictEqual(Validation.isValidClassName(name).isValid, true);
      });
    });

    ['123Class', 'class-name', 'class name', ''].forEach(name => {
      it(`should reject "${name}"`, () => {
        assert.strictEqual(Validation.isValidClassName(name).isValid, false);
      });
    });
  });

  describe('isSnakeCase', () => {
    ['snake_case', 'one', 'a_b_c', 'a_1_b', 'value123'].forEach(name => {
      it(`should accept "${name}"`, () => {
        assert.strictEqual(Validation.isSnakeCase(name).isValid, true);
      });
    });

    ['camelCase', 'PascalCase', 'snake-case', 'UPPER', 'has space', ''].forEach(name => {
      it(`should reject "${name}"`, () => {
        assert.strictEqual(Validation.isSnakeCase(name).isValid, false);
      });
    });
  });
});
