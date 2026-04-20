import { CronGroupWizardData } from 'wizard/CronGroupWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import CronGroupXmlGenerator from 'generator/cronGroup/CronGroupXmlGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import FindOrCreateXml from 'generator/xml/FindOrCreateXml';

describe('CronGroupXmlGenerator Tests', () => {
  const baseData: CronGroupWizardData = {
    module: 'Foo_Bar',
    groupId: 'my_group',
    scheduleGenerateEvery: 15,
    scheduleAheadFor: 20,
    scheduleLifetime: 15,
    historyCleanupEvery: 10,
    historySuccessLifetime: 60,
    historyFailureLifetime: 4320,
    useSeparateProcess: false,
  };

  before(async () => {
    await setup();
  });

  it('should generate cron_groups.xml with a fresh group', async () => {
    const generator = new CronGroupXmlGenerator(baseData);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const reference = getReferenceFile('generator/cronGroup/cron_groups.xml');
    assert.strictEqual(generatedFile.content, reference);
  });

  it('should generate file in correct location (global area)', async () => {
    const generator = new CronGroupXmlGenerator(baseData);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/etc/cron_groups.xml'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expected);
  });

  it('should append a second group to an existing file', async () => {
    const existing = getReferenceFile('generator/cronGroup/cron_groups.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);

    try {
      const generator = new CronGroupXmlGenerator({
        ...baseData,
        groupId: 'other_group',
        scheduleGenerateEvery: 1,
        scheduleAheadFor: 10,
        scheduleLifetime: 2,
        historyCleanupEvery: 10,
        historySuccessLifetime: 60,
        historyFailureLifetime: 600,
        useSeparateProcess: true,
      });
      const generatedFile = await generator.generate(getTestWorkspaceUri());

      const reference = getReferenceFile('generator/cronGroup/cron_groups-merged.xml');
      assert.strictEqual(generatedFile.content, reference);
    } finally {
      stub.restore();
    }
  });

  it('should skip when group id already exists (idempotent)', async () => {
    const existing = getReferenceFile('generator/cronGroup/cron_groups.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);

    try {
      const generator = new CronGroupXmlGenerator(baseData);
      const generatedFile = await generator.generate(getTestWorkspaceUri());
      assert.strictEqual(generatedFile.content, existing);
    } finally {
      stub.restore();
    }
  });
});
