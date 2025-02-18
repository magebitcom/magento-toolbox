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
    const range = document.getWordRangeAtPosition(position, /("[^"]+")|(>[^<]+<)/);

    if (!range) {
      return null;
    }

    const word = document.getText(range);

    const namespaceIndexData = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

    if (!namespaceIndexData) {
      return null;
    }

    const potentialNamespace = word.replace(/["<>]/g, '');

    const classUri = await namespaceIndexData.findClassByNamespace(
      PhpNamespace.fromString(potentialNamespace)
    );

    if (!classUri) {
      return null;
    }

    const targetPosition = await this.getClasslikeNameRange(document, classUri);

    const originSelectionRange = new Range(
      range.start.with({ character: range.start.character + 1 }),
      range.end.with({ character: range.end.character - 1 })
    );

    return [
      {
        targetUri: classUri,
        targetRange: targetPosition,
        originSelectionRange,
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
