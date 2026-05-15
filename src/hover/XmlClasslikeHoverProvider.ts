import Config from 'common/Config';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import DiIndexer from 'indexer/di/DiIndexer';
import IndexManager from 'indexer/IndexManager';
import { Hover, HoverProvider, MarkdownString, Position, TextDocument, workspace } from 'vscode';

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

    if (classUri) {
      const phpFile = await PhpDocumentParser.parseUri(document, classUri);
      const classLikeInfo = new ClasslikeInfo(phpFile);

      return new Hover(classLikeInfo.getHover(), range);
    }

    const diData = IndexManager.getIndexData(DiIndexer.KEY);
    const virtualType = diData?.findVirtualTypeByName(potentialNamespace);

    if (!virtualType) {
      return null;
    }

    const concrete = diData!.resolveVirtualTypeToConcrete(potentialNamespace);
    const markdown = new MarkdownString();
    markdown.isTrusted = true;
    markdown.appendMarkdown(`**Virtual Type:** \`${virtualType.name}\``);
    if (concrete && concrete !== virtualType.name) {
      markdown.appendMarkdown(` → \`${concrete}\``);
    }
    markdown.appendMarkdown('\n\n');

    const relativeDiPath = workspace.asRelativePath(virtualType.diPath);
    markdown.appendMarkdown(`*Defined in* \`${relativeDiPath}\`\n\n`);

    if (concrete && concrete !== virtualType.name) {
      const concreteUri = await namespaceIndexData.findUriByNamespace(
        PhpNamespace.fromString(concrete)
      );

      if (concreteUri) {
        try {
          const phpFile = await PhpDocumentParser.parseUri(document, concreteUri);
          const classLikeInfo = new ClasslikeInfo(phpFile);
          const concreteHover = classLikeInfo.getHover();
          markdown.appendMarkdown(concreteHover.value);
        } catch {
          // ignore — show only the virtual type header if parsing fails
        }
      }
    }

    return new Hover(markdown, range);
  }
}
