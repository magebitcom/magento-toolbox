import { CronJobWizardData } from 'wizard/CronJobWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CronJobXmlGenerator from 'generator/cronJob/CronJobXmlGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import FindOrCreateCrontabXml from 'generator/util/FindOrCreateCrontabXml';

describe('CronJobXmlGenerator Tests', () => {
  const cronJobWizardData: CronJobWizardData = {
    module: 'Foo_Bar',
    className: 'Class',
    cronName: 'foo_bar_class',
    cronGroup: 'default',
    cronSchedule: '* * * * *',
  };

  before(async () => {
    await setup();
  });

  it('should generate crontab.xml', async () => {
    // Create the generator with test data
    const generator = new CronJobXmlGenerator(cronJobWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/cronJob/crontab.xml');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new CronJobXmlGenerator(cronJobWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/crontab.xml').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });

  it('should add job to existing group', async () => {
    const existingCrontabXml = getReferenceFile('generator/cronJob/crontab.xml');
    // Stub FindOrCreateCrontabXml.execute to return crontab.xml with existing group
    const stub = sinon.stub(FindOrCreateCrontabXml, 'execute').resolves(existingCrontabXml);

    try {
      // Create the generator with test data
      const generator = new CronJobXmlGenerator({
        ...cronJobWizardData,
        cronName: 'new_job',
      });

      // Use a test workspace URI
      const workspaceUri = getTestWorkspaceUri();

      // Generate the file
      const generatedFile = await generator.generate(workspaceUri);

      const referenceContent = getReferenceFile('generator/cronJob/crontab-merged.xml');

      // Compare the generated content with reference
      assert.strictEqual(generatedFile.content, referenceContent);
    } finally {
      // Restore the stub
      stub.restore();
    }
  });
});
