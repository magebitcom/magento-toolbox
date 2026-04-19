import { CompletionItem, CompletionItemKind, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import Magento from 'util/Magento';

export class LayoutBlockNameCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlCompletions';
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [
      [new ElementNameMatches('referenceBlock'), new AttributeNameMatches('name')],
      [new ElementNameMatches('move'), new AttributeNameMatches('element')],
      [new ElementNameMatches('move'), new AttributeNameMatches('destination')],
    ];
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): CompletionItem[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    const area = Magento.getLayoutArea(document.uri.fsPath);

    const names = new Set<string>();

    if (layoutIndexData) {
      for (const name of layoutIndexData.getAllBlockNames(area)) {
        names.add(name);
      }
    }

    if (pageLayoutIndexData) {
      for (const name of pageLayoutIndexData.getAllBlockNames(area)) {
        names.add(name);
      }
    }

    return Array.from(names).map(name => {
      const item = new CompletionItem(name, CompletionItemKind.Reference);
      item.range = range;
      return item;
    });
  }
}
