import { Hover, Uri, Range, workspace, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import ThemeIndexer from 'indexer/theme/ThemeIndexer';
import path from 'path';
import HoverBuilder from 'hover/HoverBuilder';

export class ThemeHoverProvider extends XmlSuggestionProvider<Hover> {
  public getElementContentMatches(): CombinedCondition[] {
    return [[new ElementNameMatches('parent')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlHovers';
  }

  public getFilePatterns(): string[] {
    return ['**/theme.xml'];
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): Hover[] {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
      return [];
    }

    const themeIndexData = IndexManager.getIndexData(ThemeIndexer.KEY);

    if (!themeIndexData) {
      return [];
    }

    const theme = themeIndexData.getThemeById(value);

    if (!theme) {
      return [];
    }

    const relativePath = path.relative(workspaceFolder.uri.fsPath, theme.path);

    return [
      HoverBuilder.create()
        .title('Theme', theme.title)
        .property('ID', theme.id)
        .property('Path', relativePath)
        .property('Parent', theme.parent)
        .link('theme.xml', Uri.file(theme.path))
        .build(range),
    ];
  }
}
