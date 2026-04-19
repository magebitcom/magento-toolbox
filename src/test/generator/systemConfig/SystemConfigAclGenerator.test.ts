import { SystemConfigWizardData } from 'wizard/SystemConfigWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import SystemConfigAclGenerator from 'generator/systemConfig/SystemConfigAclGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';

describe('SystemConfigAclGenerator Tests', () => {
  const data: SystemConfigWizardData = {
    module: 'Foo_Bar',
    generateAcl: true,
    sections: [
      {
        id: 'my_section',
        label: 'My Section',
        sortOrder: 10,
        tab: 'general',
        resource: 'Foo_Bar::config',
      },
    ],
    groups: [],
    fields: [],
  };

  before(async () => {
    await setup();
  });

  it('should generate acl.xml with a fresh <acl> scaffold', async () => {
    const generator = new SystemConfigAclGenerator(data);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const reference = getReferenceFile('generator/systemConfig/acl.xml');
    assert.strictEqual(generatedFile.content, reference);
  });

  it('should generate file in correct location (adminhtml area)', async () => {
    const generator = new SystemConfigAclGenerator(data);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/etc/adminhtml/acl.xml'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expected);
  });
});
