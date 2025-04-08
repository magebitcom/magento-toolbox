import { CompletionItem, CompletionItemKind, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementAttributeMatches } from 'common/xml/suggestion/condition/ElementAttributeMatches';

export class NamespaceCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getAttributeValueConditions(): CombinedCondition[] {
    return [
      [new ElementNameMatches('preference'), new AttributeNameMatches('for')],
      [new ElementNameMatches('preference'), new AttributeNameMatches('type')],
      [new ElementNameMatches('type'), new AttributeNameMatches('name')],
      [new ElementNameMatches('plugin'), new AttributeNameMatches('type')],
      [new ElementNameMatches('virtualType'), new AttributeNameMatches('type')],
      [new AttributeNameMatches('instance')],
      [new AttributeNameMatches('class')],
      [new ElementNameMatches('attribute'), new AttributeNameMatches('type')],
      [new ElementNameMatches('extension_attributes'), new AttributeNameMatches('for')],
      [new ElementNameMatches('consumer'), new AttributeNameMatches('handler')],
      [new ElementNameMatches('queue'), new AttributeNameMatches('handler')],
      [new ElementNameMatches('handler'), new AttributeNameMatches('type')],
    ];
  }

  public getElementContentMatches(): CombinedCondition[] {
    return [
      [new ElementAttributeMatches('xsi:type', 'object')],
      [new ElementNameMatches('backend_model')],
      [new ElementNameMatches('frontend_model')],
      [new ElementNameMatches('source_model')],
    ];
  }

  public getFilePatterns(): string[] {
    return ['**/etc/**/*.xml'];
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
    const namespaceIndexData = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

    if (!namespaceIndexData) {
      return [];
    }

    const startsWithBackslash = value.startsWith('\\');

    if (startsWithBackslash) {
      value = value.replace(/^\\/, '');
    }

    const completions = namespaceIndexData.findNamespacesByPrefix(value);

    return completions.map(namespace => {
      const item = new CompletionItem(
        startsWithBackslash ? `\\${namespace.fqn}` : namespace.fqn,
        CompletionItemKind.Value
      );
      item.range = range;
      return item;
    });
  }
}
