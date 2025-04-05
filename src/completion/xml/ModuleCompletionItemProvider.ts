import { CompletionItem, CompletionItemKind } from 'vscode';
import { SuggestionProviders } from '@xml-tools/content-assist';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { XmlCompletionItemProvider } from './XmlCompletionItemProvider';

export class ModuleCompletionItemProvider extends XmlCompletionItemProvider {
  getFilePatterns(): string[] {
    return ['**/etc/module.xml'];
  }

  getCompletionProviders(): SuggestionProviders<CompletionItem> {
    return {
      attributeValue: [this.getAttributeValueCompletions.bind(this)],
    };
  }

  private getAttributeValueCompletions({
    element,
    attribute,
  }: {
    element: XMLElement;
    attribute: XMLAttribute;
  }): CompletionItem[] {
    if (
      element.name !== 'module' ||
      (element.parent as XMLElement)?.name !== 'sequence' ||
      attribute.key !== 'name'
    ) {
      return [];
    }

    const value = attribute?.value || '';
    return this.getCompletionItems(value);
  }

  private getCompletionItems(prefix: string): CompletionItem[] {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return [];
    }

    const completions = moduleIndexData.getModulesByPrefix(prefix);

    return completions.map(module => {
      return new CompletionItem(module.name, CompletionItemKind.Value);
    });
  }
}
