import { CronJobWizardData } from 'wizard/CronJobWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CronJobClassGenerator from 'generator/cronJob/CronJobClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('CronJobClassGenerator Tests', () => {
  const cronJobWizardData: CronJobWizardData = {
    module: 'Foo_Bar',
    className: 'TestCronJob',
    cronName: 'foo_bar_test_cron_job',
    cronGroup: 'default',
    cronSchedule: '* * * * *',
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate cron job class file', async () => {
    // Mock the FileHeader.getHeader method to return a consistent header
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    // Create the generator with test data
    const generator = new CronJobClassGenerator(cronJobWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Get the reference file content
    const referenceContent = getReferenceFile('generator/cronJob/TestCronJob.php');

    // Compare the generated content with reference
    assert.strictEqual(generatedFile.content, referenceContent);
  });

  it('should generate file in correct location', async () => {
    // Create the generator with test data
    const generator = new CronJobClassGenerator(cronJobWizardData);

    // Use a test workspace URI
    const workspaceUri = getTestWorkspaceUri();

    // Generate the file
    const generatedFile = await generator.generate(workspaceUri);

    // Expected path
    const expectedPath = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/Cron/TestCronJob.php').fsPath;

    assert.strictEqual(generatedFile.uri.fsPath, expectedPath);
  });
});
