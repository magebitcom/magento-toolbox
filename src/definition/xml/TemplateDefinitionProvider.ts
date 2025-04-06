import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import TemplateIndexer from 'indexer/template/TemplateIndexer';
import { ElementAttributeMatches } from 'common/xml/suggestion/condition/ElementAttributeMatches';

export class TemplateDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/view/**/layout/*.xml', '**/etc/**/di.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new AttributeNameMatches('template')]];
  }

  public getElementContentMatches(): CombinedCondition[] {
    return [
      [
        new ElementAttributeMatches('name', 'template'),
        new ElementAttributeMatches('xsi:type', 'string'),
      ],
    ];
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
    const templateIndexData = IndexManager.getIndexData(TemplateIndexer.KEY);

    if (!templateIndexData) {
      return [];
    }

    const templates = templateIndexData.getTemplatesByPrefix(value);

    if (!templates.length) {
      return [];
    }

    return templates.map(template => {
      const templateUri = Uri.file(template.path);

      return {
        targetUri: templateUri,
        targetRange: new Range(0, 0, 0, 0),
        originSelectionRange: range,
      };
    });
  }
}
