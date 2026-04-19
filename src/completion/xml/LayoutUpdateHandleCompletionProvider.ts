import { CompletionItem, CompletionItemKind, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import Magento from 'util/Magento';

export class LayoutUpdateHandleCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml'];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlCompletions';
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('update'), new AttributeNameMatches('handle')]];
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): CompletionItem[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    const area = Magento.getLayoutArea(document.uri.fsPath);

    const handles = new Set<string>();

    if (layoutIndexData) {
      for (const handle of layoutIndexData.getHandles(area)) {
        handles.add(handle);
      }
    }

    if (pageLayoutIndexData) {
      for (const handle of pageLayoutIndexData.getHandles(area)) {
        handles.add(handle);
      }
    }

    return Array.from(handles).map(handle => {
      const item = new CompletionItem(handle, CompletionItemKind.Reference);
      item.range = range;
      return item;
    });
  }
}
