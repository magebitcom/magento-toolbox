import { BlockWizardData } from 'wizard/BlockWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import BlockClassGenerator from 'generator/block/BlockClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('BlockClassGenerator Tests', () => {
  const blockWizardData: BlockWizardData = {
    module: 'Foo_Bar',
    name: 'TestBlock',
    path: 'Block',
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate block class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new BlockClassGenerator(blockWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/block/TestBlock.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new BlockClassGenerator(blockWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/Block/TestBlock.php').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate block class in custom path', async () => {
    // Create test data with custom path
    const customPathData: BlockWizardData = {
      ...blockWizardData,
      path: 'Block/Custom/Path',
    };

    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with custom path data
    const generator = new BlockClassGenerator(customPathData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content for custom path
    const referenceContent = getReferenceFile('generator/block/TestBlockCustomPath.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Block/Custom/Path/TestBlock.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
