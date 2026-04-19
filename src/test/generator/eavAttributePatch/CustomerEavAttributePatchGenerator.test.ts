import { CustomerEavAttributePatchWizardData } from 'wizard/eavAttributePatch/CustomerEavAttributePatchWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CustomerEavAttributePatchGenerator from 'generator/eavAttributePatch/CustomerEavAttributePatchGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('CustomerEavAttributePatchGenerator Tests', () => {
  const baseData: CustomerEavAttributePatchWizardData = {
    module: 'Foo_Bar',
    className: 'AddTestAttribute',
    attributeCode: 'test_attribute',
    attributeLabel: 'Test Attribute',
    attributeType: 'varchar',
    attributeInput: 'text',
    required: false,
    sortOrder: 100,
    usedInForms: ['adminhtml_customer', 'customer_account_create', 'customer_account_edit'],
    userDefined: true,
    revertable: false,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate customer EAV attribute patch file', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new CustomerEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile(
      'generator/eavAttributePatch/AddCustomerEavAttribute.php'
    );
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    const generator = new CustomerEavAttributePatchGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Setup/Patch/Data/AddTestAttribute.php'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
