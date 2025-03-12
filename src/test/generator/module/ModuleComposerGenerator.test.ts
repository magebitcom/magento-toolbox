import { ModuleWizardComposerData } from 'wizard/ModuleWizard';
import { License } from 'types';
import * as assert from 'assert';
import ModuleComposerGenerator from 'generator/module/ModuleComposerGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';

describe('ModuleComposerGenerator Tests', () => {
  const moduleWizardData: ModuleWizardComposerData = {
    vendor: 'Foo',
    module: 'Bar',
    sequence: [],
    license: License.MIT,
    version: '1.0.0',
    copyright: 'Test Copyright',
    composer: true,
    composerName: 'foo/bar-module',
    composerDescription: 'A test module',
  };

  before(async () => {
    await setup();
  });

  it('should generate composer.json', async () => {
    // Create the generator with modified test data
    const generator = new ModuleComposerGenerator(moduleWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/module/composer.json');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
