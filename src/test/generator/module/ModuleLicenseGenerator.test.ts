import * as assert from 'assert';
import * as path from 'path';
import { describe, it, before, afterEach } from 'mocha';
import sinon from 'sinon';
import ModuleLicenseGenerator from 'generator/module/ModuleLicenseGenerator';
import { ModuleWizardData } from 'wizard/ModuleWizard';
import { License } from 'types/global';
import { getTestWorkspaceUri } from 'test/util';
import { setup } from 'test/setup';

describe('ModuleLicenseGenerator Tests', () => {
  const moduleWizardData: ModuleWizardData = {
    vendor: 'Foo',
    module: 'Bar',
    sequence: [],
    license: License.MIT,
    version: '1.0.0',
    copyright: 'Test Copyright',
    composer: false,
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the license body with the injected copyright and year', async () => {
    sinon.stub(Date.prototype, 'getFullYear').returns(2026);
    const generator = new ModuleLicenseGenerator(moduleWizardData);

    const generatedFile = await generator.generate(getTestWorkspaceUri());

    assert.ok(
      generatedFile.content.startsWith('Copyright © 2026-present Test Copyright'),
      'license should start with the copyright line including the stubbed year'
    );
    assert.ok(
      generatedFile.content.includes('THE SOFTWARE IS PROVIDED'),
      'license should contain the MIT body'
    );
  });

  it('should place LICENSE.txt at the module root', async () => {
    const generator = new ModuleLicenseGenerator(moduleWizardData);

    const generatedFile = await generator.generate(getTestWorkspaceUri());

    assert.ok(
      generatedFile.uri.fsPath.endsWith(path.join('app', 'code', 'Foo', 'Bar', 'LICENSE.txt'))
    );
  });
});
