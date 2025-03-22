import { PreferenceWizardData } from 'wizard/PreferenceWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import PreferenceDiGenerator from 'generator/preference/PreferenceDiGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import { MagentoScope } from 'types/global';

describe('PreferenceDiGenerator Tests', () => {
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

  it('should generate di.xml file', async () => {
    // Create the generator with test data
    const generator = new PreferenceDiGenerator(preferenceWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/preference/di.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location for global scope', async () => {
    // Create the generator with test data
    const generator = new PreferenceDiGenerator(preferenceWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path for global scope
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/di.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate file in correct location for frontend scope', async () => {
    // Create test data with frontend scope
    const frontendData: PreferenceWizardData = {
      ...preferenceWizardData,
      area: MagentoScope.Frontend,
    };

    // Create the generator with frontend data
    const generator = new PreferenceDiGenerator(frontendData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path for frontend scope
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/frontend/di.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate file in correct location for adminhtml scope', async () => {
    // Create test data with adminhtml scope
    const adminhtmlData: PreferenceWizardData = {
      ...preferenceWizardData,
      area: MagentoScope.Adminhtml,
    };

    // Create the generator with adminhtml data
    const generator = new PreferenceDiGenerator(adminhtmlData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path for adminhtml scope
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/adminhtml/di.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
