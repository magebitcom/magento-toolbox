import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import PreferenceClassGenerator from 'generator/preference/PreferenceClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';
import { MagentoScope } from 'types/global';

describe('PreferenceClassGenerator Tests', () => {
  const preferenceWizardData: PreferenceWizardData = {
    module: 'Foo_Bar',
    className: 'TestPreference',
    directory: 'Model',
    parentClass: 'Magento\\Catalog\\Model\\Product',
    inheritClass: true,
    area: MagentoScope.Global,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate preference class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new PreferenceClassGenerator(preferenceWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/preference/TestPreference.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new PreferenceClassGenerator(preferenceWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Model/TestPreference.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate preference without inheritance', async () => {
    // Create test data without inheritance
    const noInheritanceData: PreferenceWizardData = {
      ...preferenceWizardData,
      inheritClass: false,
    };

    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with modified data
    const generator = new PreferenceClassGenerator(noInheritanceData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/preference/TestPreferenceNoInherit.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
