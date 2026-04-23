import { ProductEavAttributePatchWizardData } from 'wizard/eavAttributePatch/ProductEavAttributePatchWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ProductEavAttributePatchGenerator from 'generator/eavAttributePatch/ProductEavAttributePatchGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('ProductEavAttributePatchGenerator Tests', () => {
  const baseData: ProductEavAttributePatchWizardData = {
    module: 'Foo_Bar',
    className: 'AddTestAttribute',
    attributeCode: 'test_attribute',
    attributeLabel: 'Test Attribute',
    attributeType: 'varchar',
    attributeInput: 'text',
    required: false,
    sortOrder: 100,
    group: 'General',
    scope: 'SCOPE_GLOBAL',
    usedInProductListing: true,
    revertable: false,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate product EAV attribute patch file', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new ProductEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile(
      'generator/eavAttributePatch/AddProductEavAttribute.php'
    );
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    const generator = new ProductEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Setup/Patch/Data/AddTestAttribute.php'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate revertable variant', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new ProductEavAttributePatchGenerator({ ...baseData, revertable: true });
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile(
      'generator/eavAttributePatch/AddProductEavAttributeRevertable.php'
    );
    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
