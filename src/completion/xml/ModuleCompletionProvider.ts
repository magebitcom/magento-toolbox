import { CompletionItem, CompletionItemKind, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLAttribute } from '@xml-tools/ast';
import { XMLElement } from '@xml-tools/ast';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ParentElementNameMatches } from 'common/xml/suggestion/condition/ParentElementNameMatches';

export class ModuleCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getFilePatterns(): string[] {
    return ['**/etc/module.xml'];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlCompletions';
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [
      [new ElementNameMatches('module'), new AttributeNameMatches('name')],
      [new ElementNameMatches('module'), new ParentElementNameMatches('route')],
    ];
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): CompletionItem[] {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return [];
    }

    const completions = moduleIndexData.getModulesByPrefix(value);

    return completions.map(module => {
      const item = new CompletionItem(module.name, CompletionItemKind.Value);
      item.range = range;
      return item;
    });
  }
}
