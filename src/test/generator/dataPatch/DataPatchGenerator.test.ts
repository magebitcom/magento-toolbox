import { DataPatchWizardData } from 'wizard/DataPatchWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import DataPatchGenerator from 'generator/dataPatch/DataPatchGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('DataPatchGenerator Tests', () => {
  const basePatchWizardData: DataPatchWizardData = {
    module: 'Foo_Bar',
    className: 'TestDataPatch',
    revertable: false,
  };

  const revertablePatchWizardData: DataPatchWizardData = {
    module: 'Foo_Bar',
    className: 'TestRevertableDataPatch',
    revertable: true,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate a standard data patch file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');
    // Create the generator with test data
    const generator = new DataPatchGenerator(basePatchWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/dataPatch/patch.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate a revertable data patch file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new DataPatchGenerator(revertablePatchWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/dataPatch/patchRevertable.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new DataPatchGenerator(basePatchWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Setup/Patch/Data/TestDataPatch.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
