import { CategoryEavAttributePatchWizardData } from 'wizard/eavAttributePatch/CategoryEavAttributePatchWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CategoryEavAttributePatchGenerator from 'generator/eavAttributePatch/CategoryEavAttributePatchGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('CategoryEavAttributePatchGenerator Tests', () => {
  const baseData: CategoryEavAttributePatchWizardData = {
    module: 'Foo_Bar',
    className: 'AddTestAttribute',
    attributeCode: 'test_attribute',
    attributeLabel: 'Test Attribute',
    attributeType: 'varchar',
    attributeInput: 'text',
    required: false,
    sortOrder: 100,
    group: 'General Information',
    revertable: false,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate category EAV attribute patch file', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new CategoryEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile(
      'generator/eavAttributePatch/AddCategoryEavAttribute.php'
    );
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    const generator = new CategoryEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Setup/Patch/Data/AddTestAttribute.php'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
