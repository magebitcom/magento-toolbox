import { ModuleWizardData } from 'wizard/ModuleWizard';
import { License } from 'types';
import * as assert from 'assert';
import { extensions, Uri } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ModuleRegistrationGenerator from 'generator/module/ModuleRegistrationGenerator';
import Common from 'util/Common';
import ExtensionState from 'common/ExtensionState';

suite('ModuleRegistrationGenerator Tests', () => {
  let moduleWizardData: ModuleWizardData;

  setup(async () => {
    // Create test module data
    moduleWizardData = {
      vendor: 'Foo',
      module: 'Bar',
      sequence: [],
      license: License.None,
      version: '1.0.0',
      copyright: 'Test Copyright',
      composer: false,
    };

    const extension = extensions.getExtension(Common.EXTENSION_ID);
    const context = await extension?.activate();

    ExtensionState.init(context, []);
  });

  test('should generate registration.php matching reference file', async () => {
    // Create the generator with test data
    const generator = new ModuleRegistrationGenerator(moduleWizardData);

    // Use a test workspace URI
    const workspaceUri = Uri.file(path.resolve(__dirname, '../../../'));

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the content of the reference file
    const refFilePath = path.resolve(__dirname, 'registration.php');
    const referenceContent = fs.readFileSync(refFilePath, 'utf8');

    assert.strictEqual(generatedFile.content, referenceContent);
  });
});
