import { ObserverWizardData } from 'wizard/ObserverWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ObserverEventsGenerator from 'generator/observer/ObserverEventsGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import { MagentoScope } from 'types';
import FileHeader from 'common/xml/FileHeader';
import sinon from 'sinon';

describe('ObserverEventsGenerator Tests', () => {
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

  it('should generate events.xml', async () => {
    // Create the generator with test data
    const generator = new ObserverEventsGenerator(observerWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/observer/events.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new ObserverEventsGenerator(observerWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/etc/frontend/events.xml'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate events.xml in adminhtml area', async () => {
    // Create test data with adminhtml area
    const adminhtmlData: ObserverWizardData = {
      ...observerWizardData,
      area: MagentoScope.Adminhtml,
    };

    // Create the generator with adminhtml data
    const generator = new ObserverEventsGenerator(adminhtmlData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/observer/events-adminhtml.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/etc/adminhtml/events.xml'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate events.xml with comment', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('<!--\nFoo_Bar\n-->');

    // Create the generator with test data
    const generator = new ObserverEventsGenerator(observerWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/observer/events-with-comment.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
