import { ObserverWizardData } from 'wizard/ObserverWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ObserverClassGenerator from 'generator/observer/ObserverClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';
import { MagentoScope } from 'types/global';

describe('ObserverClassGenerator Tests', () => {
  const observerWizardData: ObserverWizardData = {
    module: 'Foo_Bar',
    className: 'TestObserver',
    directoryPath: 'Observer',
    eventName: 'test_event',
    observerName: 'test_observer',
    area: MagentoScope.Frontend,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate observer class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new ObserverClassGenerator(observerWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/observer/TestObserver.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new ObserverClassGenerator(observerWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Observer/TestObserver.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate observer in custom path', async () => {
    // Create test data with custom path
    const customPathData: ObserverWizardData = {
      ...observerWizardData,
      directoryPath: 'Observer/Custom/Path',
    };

    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with custom path data
    const generator = new ObserverClassGenerator(customPathData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/observer/TestObserverCustomPath.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Observer/Custom/Path/TestObserver.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
