import { ModuleWizardData } from 'wizard/ModuleWizard';
import { License } from 'types';
import * as assert from 'assert';
import ModuleRegistrationGenerator from 'generator/module/ModuleRegistrationGenerator';
import FileHeader from 'common/php/FileHeader';
import { describe, it, after, before } from 'mocha';
import sinon from 'sinon';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import { setup } from 'test/setup';

describe('ModuleRegistrationGenerator Tests', () => {
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

  after(async () => {
    sinon.restore();
  });

  it('should generate registration.php', async () => {
    // Create the generator with test data
    const generator = new ModuleRegistrationGenerator(moduleWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the content of the reference file
    const referenceContent = getReferenceFile('generator/module/registration.php');

    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate registration.php with comment', async () => {
    // Create the generator with test data
    const generator = new ModuleRegistrationGenerator(moduleWizardData);

    // Mock the FileHeader.getHeaderAsComment method to return a test comment
    sinon.stub(FileHeader, 'getHeader').returns('This is a test comment');

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the content of the reference file with comments
    const referenceContent = getReferenceFile('generator/module/registration-with-comment.php');

    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
