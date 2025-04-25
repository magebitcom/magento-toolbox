import Config from 'common/Config';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import IndexManager from 'indexer/IndexManager';
import {
  DefinitionProvider,
  TextDocument,
  Position,
  CancellationToken,
  LocationLink,
  Uri,
  Range,
} from 'vscode';

export class XmlClasslikeDefinitionProvider implements DefinitionProvider {
  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ) {
    const provideXmlDefinitions = Config.get<boolean>('provideXmlDefinitions', true);

    if (!provideXmlDefinitions) {
      return null;
    }

    const range = document.getWordRangeAtPosition(
      position,
      /((?:\\{1,2}\w+|\w+\\{1,2})(?:\w+\\{0,2})+)/
    );

    if (!range) {
      return null;
    }

    const word = document.getText(range);

    const namespaceIndexData = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

    if (!namespaceIndexData) {
      return null;
    }

    // also handle constants
    const potentialNamespace = word.split(':').shift()?.trim();

    if (!potentialNamespace) {
      return null;
    }

    const classUri = await namespaceIndexData.findUriByNamespace(
      PhpNamespace.fromString(potentialNamespace)
    );

    if (!classUri) {
      return null;
    }

    const targetPosition = await this.getClasslikeNameRange(document, classUri);

    return [
      {
        targetUri: classUri,
        targetRange: targetPosition,
        originSelectionRange: range,
      } as LocationLink,
    ];
  }

  private async getClasslikeNameRange(
    document: TextDocument,
    classUri: Uri
  ): Promise<Position | Range> {
    const phpFile = await PhpDocumentParser.parseUri(document, classUri);
    const classLikeInfo = new ClasslikeInfo(phpFile);
    const range = classLikeInfo.getNameRange();

    if (!range) {
      return new Position(0, 0);
    }

    return range;
  }
}
