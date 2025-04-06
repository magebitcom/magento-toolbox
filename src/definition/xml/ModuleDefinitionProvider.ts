import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';

export class ModuleDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/etc/module.xml', '**/etc/**/routes.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('module'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlDefinitions';
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): LocationLink[] {
    if (!attribute) {
      return [];
    }

    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return [];
    }

    const module = moduleIndexData.getModule(value);

    if (!module) {
      return [];
    }

    const moduleXmlUri = Uri.file(module.moduleXmlPath);

    return [
      {
        targetUri: moduleXmlUri,
        targetRange: new Range(0, 0, 0, 0),
        originSelectionRange: new Range(
          attribute.position.startLine - 1,
          attribute.position.startColumn + 5,
          attribute.position.endLine - 1,
          attribute.position.endColumn - 1
        ),
      },
    ];
  }
}
