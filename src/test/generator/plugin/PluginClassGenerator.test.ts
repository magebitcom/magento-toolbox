import { PluginContextWizardData } from 'wizard/PluginContextWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import PluginClassGenerator from 'generator/plugin/PluginClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getReferenceFilePath, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpMethod } from 'parser/php/PhpMethod';
import { MagentoScope } from 'types/global';
import PhpParser from 'parser/php/Parser';

describe('PluginClassGenerator Tests', () => {
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

  afterEach(() => {
    sinon.restore();
  });

  it('should generate plugin class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new PluginClassGenerator(pluginWizardData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/plugin/TestPlugin.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new PluginClassGenerator(pluginWizardData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Plugin/TestPlugin.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should generate plugin in custom path', async () => {
    // Create test data with custom path
    const customPathData: PluginContextWizardData = {
      ...pluginWizardData,
      className: 'Custom/Path/TestPlugin',
    };

    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with custom path data
    const generator = new PluginClassGenerator(customPathData, subjectClass, subjectMethod);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/plugin/TestPluginCustomPath.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);

    // Verify file location
    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Plugin/Custom/Path/TestPlugin.php'
    ).fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
