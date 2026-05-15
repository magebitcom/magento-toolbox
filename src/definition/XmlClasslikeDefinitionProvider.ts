import Config from 'common/Config';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import DiIndexer from 'indexer/di/DiIndexer';
import IndexManager from 'indexer/IndexManager';
import { findVirtualTypeRange } from './util/findVirtualTypeRange';
import { DefinitionProvider, TextDocument, Position, LocationLink, Uri, Range } from 'vscode';

export class XmlClasslikeDefinitionProvider implements DefinitionProvider {
  public async provideDefinition(document: TextDocument, position: Position) {
    const provideXmlDefinitions = Config.get<boolean>('provideXmlDefinitions');

    if (!provideXmlDefinitions) {
      return null;
    }

    const range = document.getWordRangeAtPosition(position, /(\\?\w+(?:\\{1,2}\w+)*)/);

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

    if (potentialNamespace.includes('\\')) {
      const classUri = await namespaceIndexData.findUriByNamespace(
        PhpNamespace.fromString(potentialNamespace)
      );

      if (classUri) {
        const targetPosition = await this.getClasslikeNameRange(document, classUri);

        return [
          {
            targetUri: classUri,
            targetRange: targetPosition,
            originSelectionRange: range,
          } as LocationLink,
        ];
      }
    }

    const diData = IndexManager.getIndexData(DiIndexer.KEY);
    const virtualType = diData?.findVirtualTypeByName(potentialNamespace);

    if (!virtualType) {
      return null;
    }

    const target = await findVirtualTypeRange(virtualType.diPath, virtualType.name);

    if (!target) {
      return [
        {
          targetUri: Uri.file(virtualType.diPath),
          targetRange: new Range(0, 0, 0, 0),
          originSelectionRange: range,
        } as LocationLink,
      ];
    }

    return [
      {
        targetUri: target.uri,
        targetRange: target.range,
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
