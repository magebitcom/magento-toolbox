import { ControllerWizardData } from 'wizard/ControllerWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import ControllerRoutesGenerator from 'generator/controller/ControllerRoutesGenerator';
import { describe, it, before } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import sinon from 'sinon';
import FindOrCreateXml from 'generator/xml/FindOrCreateXml';

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

describe('ControllerRoutesGenerator Tests', () => {
  before(async () => {
    await setup();
  });

  it('generates fresh frontend routes.xml', async () => {
    const generator = new ControllerRoutesGenerator(baseData);
    const generated = await generator.generate(getTestWorkspaceUri());
    const reference = getReferenceFile('generator/controller/routes-frontend.xml');
    assert.strictEqual(generated.content, reference);
  });

  it('places the file under etc/frontend/', async () => {
    const generator = new ControllerRoutesGenerator(baseData);
    const generated = await generator.generate(getTestWorkspaceUri());
    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/etc/frontend/routes.xml'
    ).fsPath;
    assert.strictEqual(generated.uri.fsPath, expected);
  });

  it('places admin routes.xml under etc/adminhtml/', async () => {
    const generator = new ControllerRoutesGenerator({
      ...baseData,
      area: 'adminhtml',
      routeId: 'foo_bar_admin',
      frontName: 'foo_bar',
    });
    const generated = await generator.generate(getTestWorkspaceUri());
    const expected = Uri.joinPath(
      getTestWorkspaceUri(),
      'app/code/Foo/Bar/etc/adminhtml/routes.xml'
    ).fsPath;
    assert.strictEqual(generated.uri.fsPath, expected);

    const reference = getReferenceFile('generator/controller/routes-admin.xml');
    assert.strictEqual(generated.content, reference);
  });

  it('appends a new route to an existing router', async () => {
    const existing = getReferenceFile('generator/controller/routes-frontend.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);
    try {
      const generator = new ControllerRoutesGenerator({
        ...baseData,
        routeId: 'other_route',
        frontName: 'other-route',
      });
      const generated = await generator.generate(getTestWorkspaceUri());
      const reference = getReferenceFile('generator/controller/routes-frontend-merged.xml');
      assert.strictEqual(generated.content, reference);
    } finally {
      stub.restore();
    }
  });

  it('is idempotent when the route id already exists', async () => {
    const existing = getReferenceFile('generator/controller/routes-frontend.xml');
    const stub = sinon.stub(FindOrCreateXml, 'execute').resolves(existing);
    try {
      const generator = new ControllerRoutesGenerator(baseData);
      const generated = await generator.generate(getTestWorkspaceUri());
      assert.strictEqual(generated.content, existing);
    } finally {
      stub.restore();
    }
  });
});
