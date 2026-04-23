import { GraphqlResolverWizardData } from 'wizard/GraphqlResolverWizard';
import * as assert from 'assert';
import { Uri } from 'vscode';
import GraphqlResolverClassGenerator from 'generator/graphqlResolver/GraphqlResolverClassGenerator';
import { describe, it, before, afterEach } from 'mocha';
import { setup } from 'test/setup';
import { getReferenceFile, getTestWorkspaceUri } from 'test/util';
import FileHeader from 'common/php/FileHeader';
import sinon from 'sinon';

describe('GraphqlResolverClassGenerator Tests', () => {
  const baseData: GraphqlResolverWizardData = {
    module: 'Foo_Bar',
    className: 'TestResolver',
    directoryPath: 'Model/Resolver',
    description: 'Resolves the test field.',
  };

  before(async () => {
    await setup();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should generate a GraphQL resolver class file', async () => {
    sinon.stub(FileHeader, 'getHeader').returns('Foo_Bar');

    const generator = new GraphqlResolverClassGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const reference = getReferenceFile('generator/graphqlResolver/TestResolver.php');
    assert.strictEqual(generatedFile.content, reference);
  });

  it('should generate file in correct location', async () => {
    const generator = new GraphqlResolverClassGenerator(baseData);
    const workspaceUri = getTestWorkspaceUri();
    const generatedFile = await generator.generate(workspaceUri);

    const expected = Uri.joinPath(
      workspaceUri,
      'app/code/Foo/Bar/Model/Resolver/TestResolver.php'
    ).fsPath;
    assert.strictEqual(generatedFile.uri.fsPath, expected);
  });
});
