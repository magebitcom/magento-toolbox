import { SystemConfigWizardData } from 'wizard/SystemConfigWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import SystemConfigXmlGenerator from 'generator/systemConfig/SystemConfigXmlGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import FindOrCreateXml from 'generator/xml/FindOrCreateXml';

describe('SystemConfigXmlGenerator Tests', () => {
  const singleSectionData: SystemConfigWizardData = {
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
        sourceModel: 'Magento\\Config\\Model\\Config\\Source\\Yesno',
        comment: 'Enable the feature',
      },
      {
        sectionRef: 'my_section',
        groupRef: 'my_group',
        id: 'name',
        label: 'Name',
        type: 'text',
        sortOrder: 20,
      },
    ],
  };

  before(async () => {
    await setup();
  });

  it('should generate system.xml with a fresh section', async () => {
    const generator = new SystemConfigXmlGenerator(singleSectionData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const reference = getReferenceFile('generator/systemConfig/system.xml');
    assert.strictEqual(generatedFile.content, reference);
  });

  it('should generate file in correct location (adminhtml area)', async () => {
    const generator = new SystemConfigXmlGenerator(singleSectionData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expected = Uri.joinPath(workspaceUri, 'app/code/Foo/Bar/etc/adminhtml/system.xml').fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expected);
  });

  it('should append a new group to an existing section', async () => {
    const existing = getReferenceFile('generator/systemConfig/system.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);

    try {
      const generator = new SystemConfigXmlGenerator({
        ...singleSectionData,
        groups: [
          { sectionRef: 'my_section', id: 'other_group', label: 'Other Group', sortOrder: 10 },
        ],
        fields: [
          {
            sectionRef: 'my_section',
            groupRef: 'other_group',
            id: 'debug',
            label: 'Debug',
            type: 'select',
            sortOrder: 10,
          },
        ],
      });
      const generatedFile = await generator.generate(getTestWorkspaceUri());

      const reference = getReferenceFile('generator/systemConfig/system-group-merged.xml');
      assert.strictEqual(generatedFile.content, reference);
    } finally {
      stub.restore();
    }
  });

  it('should append fields into an existing group', async () => {
    const existing = getReferenceFile('generator/systemConfig/system.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);

    try {
      const generator = new SystemConfigXmlGenerator({
        ...singleSectionData,
        groups: [{ sectionRef: 'my_section', id: 'my_group', label: 'My Group', sortOrder: 10 }],
        fields: [
          {
            sectionRef: 'my_section',
            groupRef: 'my_group',
            id: 'logging',
            label: 'Logging',
            type: 'select',
            sortOrder: 30,
          },
        ],
      });
      const generatedFile = await generator.generate(getTestWorkspaceUri());

      const reference = getReferenceFile('generator/systemConfig/system-fields-merged.xml');
      assert.strictEqual(generatedFile.content, reference);
    } finally {
      stub.restore();
    }
  });

  it('should generate multiple sections in one invocation', async () => {
    const generator = new SystemConfigXmlGenerator({
      module: 'Foo_Bar',
      generateAcl: false,
      sections: [
        {
          id: 'alpha',
          label: 'Alpha',
          sortOrder: 10,
          tab: 'general',
          resource: 'Foo_Bar::alpha',
        },
        { id: 'beta', label: 'Beta', sortOrder: 20, tab: 'general', resource: 'Foo_Bar::beta' },
      ],
      groups: [
        { sectionRef: 'alpha', id: 'main', label: 'Main', sortOrder: 10 },
        { sectionRef: 'beta', id: 'main', label: 'Main', sortOrder: 10 },
      ],
      fields: [
        {
          sectionRef: 'alpha',
          groupRef: 'main',
          id: 'enabled',
          label: 'Enabled',
          type: 'select',
          sortOrder: 10,
        },
        {
          sectionRef: 'beta',
          groupRef: 'main',
          id: 'enabled',
          label: 'Enabled',
          type: 'select',
          sortOrder: 10,
        },
      ],
    });
    const generatedFile = await generator.generate(getTestWorkspaceUri());
    const reference = getReferenceFile('generator/systemConfig/system-multi-section.xml');
    assert.strictEqual(generatedFile.content, reference);
  });
});
