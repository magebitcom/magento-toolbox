import { ControllerWizardData } from 'wizard/ControllerWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ControllerClassGenerator from 'generator/controller/ControllerClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

const baseData: ControllerWizardData = {
  module: 'Foo_Bar',
  area: 'frontend',
  routeId: 'foo_bar',
  frontName: 'foo-bar',
  controllerPath: 'Index',
  className: 'Index',
  resultType: 'page',
  httpMethod: 'get',
  aclResource: '',
};

describe('ControllerClassGenerator Tests', () => {
  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('generates a frontend GET+Page controller', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');
    const generator = new ControllerClassGenerator(baseData);
    const generated = await generator.generate(getTestWorkspaceUri());

    const reference = getReferenceFile('generator/controller/FrontendGetPage.php');
    assert.strictEqual(generated.content, reference);
  });

  it('places the frontend controller in the right file', async () => {
    const generator = new ControllerClassGenerator(baseData);
    const generated = await generator.generate(getTestWorkspaceUri());
    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/Controller/Index/Index.php'
    ).fsPath;
    assert.strictEqual(generated.uri.fsPath, expected);
  });

  it('generates a frontend POST+JSON controller', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');
    const generator = new ControllerClassGenerator({
      ...baseData,
      controllerPath: 'Api',
      className: 'Save',
      resultType: 'json',
      httpMethod: 'post',
    });
    const generated = await generator.generate(getTestWorkspaceUri());
    const reference = getReferenceFile('generator/controller/FrontendPostJson.php');
    assert.strictEqual(generated.content, reference);
  });

  it('generates an admin GET+Page controller with ADMIN_RESOURCE', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');
    const generator = new ControllerClassGenerator({
      ...baseData,
      area: 'adminhtml',
      controllerPath: 'Item',
      className: 'Edit',
      aclResource: 'Foo_Bar::items',
    });
    const generated = await generator.generate(getTestWorkspaceUri());
    const reference = getReferenceFile('generator/controller/AdminGetPage.php');
    assert.strictEqual(generated.content, reference);

    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/Controller/Adminhtml/Item/Edit.php'
    ).fsPath;
    assert.strictEqual(generated.uri.fsPath, expected);
  });

  it('handles a nested controllerPath correctly', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');
    const generator = new ControllerClassGenerator({
      ...baseData,
      controllerPath: 'Account/Password',
      className: 'Reset',
      httpMethod: 'both',
    });
    const generated = await generator.generate(getTestWorkspaceUri());
    const reference = getReferenceFile('generator/controller/FrontendNestedPath.php');
    assert.strictEqual(generated.content, reference);

    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/Controller/Account/Password/Reset.php'
    ).fsPath;
    assert.strictEqual(generated.uri.fsPath, expected);
  });
});
