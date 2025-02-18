import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import IndexManager from 'indexer/IndexManager';
import { Hover, HoverProvider, Position, Range, TextDocument } from 'vscode';

export default class XmlClasslikeHoverProvider implements HoverProvider {
  public async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
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

    const phpFile = await PhpDocumentParser.parseUri(document, classUri);
    const classLikeInfo = new ClasslikeInfo(phpFile);

    const rangeWithoutTags = new Range(
      range.start.with({ character: range.start.character + 1 }),
      range.end.with({ character: range.end.character - 1 })
    );

    return new Hover(classLikeInfo.getHover(), rangeWithoutTags);
  }
}
