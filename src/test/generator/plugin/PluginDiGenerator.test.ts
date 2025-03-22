import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import PluginDiGenerator from 'generator/plugin/PluginDiGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getReferenceFilePath, getTestWorkspaceUri } from 'test/util';
import { MagentoScope } from 'types/global';
import { PhpClass } from 'parser/php/PhpClass';
import PhpParser from 'parser/php/Parser';
import { PhpMethod } from 'parser/php/PhpMethod';

describe('PluginDiGenerator Tests', () => {
  const pluginWizardData: PluginContextWizardData = {
    module: 'Foo_Bar',
    className: 'TestPlugin',
    name: 'test_plugin',
    type: 'around',
    method: 'setData',
    sortOrder: 10,
    scope: MagentoScope.Global,
  };

  let subjectClass: PhpClass;
  let subjectMethod: PhpMethod;

  before(async () => {
    await setup();

    const parser = new PhpParser();
    const referenceFilePath = getReferenceFilePath('generator/plugin/SubjectClass.php');
    const phpFile = await parser.parse(Uri.file(referenceFilePath));
    subjectClass = phpFile.classes[0];
    subjectMethod = subjectClass.methods[0];
  });

  it('should generate di.xml', async () => {
    // Create the generator with test data
    const generator = new PluginDiGenerator(pluginWizardData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/plugin/di.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new PluginDiGenerator(pluginWizardData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/di.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate di.xml in adminhtml area', async () => {
    // Create test data with adminhtml area
    const adminhtmlData: PluginContextWizardData = {
      ...pluginWizardData,
      scope: MagentoScope.Adminhtml,
    };

    // Create the generator with adminhtml data
    const generator = new PluginDiGenerator(adminhtmlData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/plugin/di-adminhtml.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/adminhtml/di.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
