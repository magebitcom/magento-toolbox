import { CompletionItem, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import TemplateIndexer from 'indexer/template/TemplateIndexer';
import { ElementAttributeMatches } from 'common/xml/suggestion/condition/ElementAttributeMatches';

export class TemplateCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
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
    return 'provideXmlCompletions';
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): CompletionItem[] {
    const templateIndexData = IndexManager.getIndexData(TemplateIndexer.KEY);

    if (!templateIndexData) {
      return [];
    }

    const templates = templateIndexData.getTemplatesByPrefix(value);

    return templates.map(template => {
      const item = new CompletionItem(template.magentoPath);
      item.range = range;
      return item;
    });
  }
}
