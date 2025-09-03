import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import ThemeIndexer from 'indexer/theme/ThemeIndexer';

export class ThemeDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/theme.xml'];
  }

  public getElementContentMatches(): CombinedCondition[] {
    return [[new ElementNameMatches('parent')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideThemeDefinitions';
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): LocationLink[] {
    const themeIndexData = IndexManager.getIndexData(ThemeIndexer.KEY);

    if (!themeIndexData) {
      return [];
    }

    const theme = themeIndexData.getThemeById(value);

    if (!theme) {
      return [];
    }

    return [
      {
        targetUri: Uri.file(theme.path),
        targetRange: new Range(0, 0, 0, 0),
        originSelectionRange: range,
      },
    ];
  }
}
