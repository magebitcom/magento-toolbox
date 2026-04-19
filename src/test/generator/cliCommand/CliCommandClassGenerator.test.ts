import { CliCommandWizardData } from 'wizard/CliCommandWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CliCommandClassGenerator from 'generator/cliCommand/CliCommandClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('CliCommandClassGenerator Tests', () => {
  const cliCommandWizardData: CliCommandWizardData = {
    module: 'Foo_Bar',
    className: 'TestCliCommand',
    commandName: 'foo:bar:test',
    itemName: 'foo_bar_test',
    description: 'Runs the test command',
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate CLI command class file', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new CliCommandClassGenerator(cliCommandWizardData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile('generator/cliCommand/TestCliCommand.php');
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    const generator = new CliCommandClassGenerator(cliCommandWizardData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expectedPath = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Console/Command/TestCliCommand.php'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
