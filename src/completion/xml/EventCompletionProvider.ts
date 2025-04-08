import { TextDocument, CompletionItem, CompletionItemKind, Range } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import EventsIndexer from 'indexer/events/EventsIndexer';

export class EventCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getFilePatterns(): string[] {
    return ['**/etc/events.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('event'), new AttributeNameMatches('name')]];
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
  ): CompletionItem[] {
    const eventIndexData = IndexManager.getIndexData(EventsIndexer.KEY);

    if (!eventIndexData) {
      return [];
    }

    const events = eventIndexData.getEventsByPrefix(value);

    if (!events) {
      return [];
    }

    return events.map(event => {
      const item = new CompletionItem(event.name, CompletionItemKind.Value);
      item.range = range;
      return item;
    });
  }
}
