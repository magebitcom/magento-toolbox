import Config from 'common/Config';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import IndexManager from 'indexer/IndexManager';
import { Hover, HoverProvider, Position, Range, TextDocument } from 'vscode';

export default class XmlClasslikeHoverProvider implements HoverProvider {
  public async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
    const provideXmlHovers = Config.get<boolean>('provideXmlHovers');

    if (!provideXmlHovers) {
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

    const phpFile = await PhpDocumentParser.parseUri(document, classUri);
    const classLikeInfo = new ClasslikeInfo(phpFile);

    return new Hover(classLikeInfo.getHover(), range);
  }
}
