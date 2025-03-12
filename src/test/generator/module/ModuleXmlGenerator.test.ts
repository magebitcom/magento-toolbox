import { ModuleWizardData } from 'wizard/ModuleWizard';
import { License } from 'types';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ModuleXmlGenerator from 'generator/module/ModuleXmlGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';

describe('ModuleXmlGenerator Tests', () => {
  const moduleWizardData: ModuleWizardData = {
    vendor: 'Foo',
    module: 'Bar',
    sequence: [],
    license: License.None,
    version: '1.0.0',
    copyright: 'Test Copyright',
    composer: false,
  };

  before(async () => {
    await setup();
  });

  it('should generate module.xml', async () => {
    // Create the generator with test data
    const generator = new ModuleXmlGenerator(moduleWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/module/module.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new ModuleXmlGenerator(moduleWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/module.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate module.xml with sequence', async () => {
    // Create test data with sequence
    const dataWithSequence: ModuleWizardData = {
      ...moduleWizardData,
      sequence: ['Magento_Catalog', 'Magento_Customer'],
    };

    // Create the generator with sequence data
    const generator = new ModuleXmlGenerator(dataWithSequence);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/module/module-with-sequence.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
