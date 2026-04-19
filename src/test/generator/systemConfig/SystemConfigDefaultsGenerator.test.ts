import { SystemConfigWizardData } from 'wizard/SystemConfigWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import SystemConfigDefaultsGenerator from 'generator/systemConfig/SystemConfigDefaultsGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';

describe('SystemConfigDefaultsGenerator Tests', () => {
  const data: SystemConfigWizardData = {
    module: 'Foo_Bar',
    generateAcl: false,
    sections: [
      {
        id: 'my_section',
        label: 'My Section',
        sortOrder: 10,
        tab: 'general',
        resource: 'Foo_Bar::config',
      },
    ],
    groups: [{ sectionRef: 'my_section', id: 'my_group', label: 'My Group', sortOrder: 10 }],
    fields: [
      {
        sectionRef: 'my_section',
        groupRef: 'my_group',
        id: 'enabled',
        label: 'Enabled',
        type: 'select',
        sortOrder: 10,
        default: '1',
      },
      {
        sectionRef: 'my_section',
        groupRef: 'my_group',
        id: 'name',
        label: 'Name',
        type: 'text',
        sortOrder: 20,
        default: 'World',
      },
    ],
  };

  before(async () => {
    await setup();
  });

  it('should generate config.xml with a fresh <default> tree', async () => {
    const generator = new SystemConfigDefaultsGenerator(data);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const reference = getReferenceFile('generator/systemConfig/config.xml');
    assert.strictEqual(generatedFile.content, reference);
  });

  it('should generate file in correct location (global area)', async () => {
    const generator = new SystemConfigDefaultsGenerator(data);
    const generatedFile = await generator.generate(getTestWorkspaceUri());

    const expected = Uri.joinPath(getTestWorkspaceUri(), 'app/code/Foo/Bar/etc/config.xml').fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expected);
  });
});
