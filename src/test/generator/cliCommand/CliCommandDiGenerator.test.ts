import { CliCommandWizardData } from 'wizard/CliCommandWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CliCommandDiGenerator from 'generator/cliCommand/CliCommandDiGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import FindOrCreateXml from 'generator/xml/FindOrCreateXml';

describe('CliCommandDiGenerator Tests', () => {
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

  it('should generate di.xml', async () => {
    const generator = new CliCommandDiGenerator(cliCommandWizardData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const referenceContent = getReferenceFile('generator/cliCommand/di.xml');
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    const generator = new CliCommandDiGenerator(cliCommandWizardData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/di.xml').fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should add item to existing commands argument', async () => {
    const existingDiXml = getReferenceFile('generator/cliCommand/di.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existingDiXml);

    try {
      const generator = new CliCommandDiGenerator({
        ...cliCommandWizardData,
        className: 'AnotherCliCommand',
        itemName: 'foo_bar_another',
        commandName: 'foo:bar:another',
      });
      const workspaceUri = getTestWorkspaceUri();
      const generatedFile = await generator.generate(workspaceUri);

      const referenceContent = getReferenceFile('generator/cliCommand/di-merged.xml');
      assert.strictEqual(generatedFile.content, referenceContent);
    } finally {
      stub.restore();
    }
  });
});
