import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import { AutoloadNamespaceIndexData } from 'indexer/autoload-namespace/AutoloadNamespaceIndexData';
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
  private namespaceIndexData: AutoloadNamespaceIndexData | undefined;

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ) {
    const range = document.getWordRangeAtPosition(position, /"[^"]*"/);

    if (!range) {
      return null;
    }

    const word = document.getText(range);

    const namespaceIndexData = this.getNamespaceIndexData();

    if (!namespaceIndexData) {
      return null;
    }

    const potentialNamespace = word.replace(/"/g, '');

    const classUri = await namespaceIndexData.findClassByNamespace(
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

  private getNamespaceIndexData(): AutoloadNamespaceIndexData | undefined {
    if (!this.namespaceIndexData) {
      const namespaceIndex = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

      if (!namespaceIndex) {
        return undefined;
      }

      this.namespaceIndexData = new AutoloadNamespaceIndexData(namespaceIndex);
    }

    return this.namespaceIndexData;
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
