import { ViewModelWizardData } from 'wizard/ViewModelWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ViewModelClassGenerator from 'generator/viewModel/ViewModelClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('ViewModelClassGenerator Tests', () => {
  const viewModelWizardData: ViewModelWizardData = {
    module: 'Foo_Bar',
    className: 'TestViewModel',
    directory: 'ViewModel',
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate viewModel class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new ViewModelClassGenerator(viewModelWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/viewModel/TestViewModel.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new ViewModelClassGenerator(viewModelWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/ViewModel/TestViewModel.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate viewModel class in custom directory', async () => {
    // Create test data with custom directory
    const customDirectoryData: ViewModelWizardData = {
      ...viewModelWizardData,
      directory: 'ViewModel/Custom/Path',
    };

    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with custom directory data
    const generator = new ViewModelClassGenerator(customDirectoryData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content for custom directory
    const referenceContent = getReferenceFile('generator/viewModel/TestViewModelCustomPath.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/ViewModel/Custom/Path/TestViewModel.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
