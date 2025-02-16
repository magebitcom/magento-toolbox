import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import { AutoloadNamespaceIndexData } from 'indexer/autoload-namespace/AutoloadNamespaceIndexData';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import IndexManager from 'indexer/IndexManager';
import Common from 'util/Common';
import { Hover, HoverProvider, Position, TextDocument } from 'vscode';

export default class XmlClasslikeHoverProvider implements HoverProvider {
  private namespaceIndexData: AutoloadNamespaceIndexData | undefined;

  public async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
    Common.startStopwatch('hover');
    const range = document.getWordRangeAtPosition(position, /"[^"]*"/);

    if (!range) {
      Common.stopStopwatch('hover');
      return null;
    }

    const word = document.getText(range);

    const namespaceIndexData = this.getNamespaceIndexData();

    if (!namespaceIndexData) {
      Common.stopStopwatch('hover');
      return null;
    }

    const potentialNamespace = word.replace(/"/g, '');

    const classUri = await namespaceIndexData.findClassByNamespace(
      PhpNamespace.fromString(potentialNamespace)
    );

    if (!classUri) {
      Common.stopStopwatch('hover');
      return null;
    }

    const phpFile = await PhpDocumentParser.parseUri(document, classUri);
    const classLikeInfo = new ClasslikeInfo(phpFile);

    Common.stopStopwatch('hover');
    return new Hover(classLikeInfo.getHover(), range);
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
}
