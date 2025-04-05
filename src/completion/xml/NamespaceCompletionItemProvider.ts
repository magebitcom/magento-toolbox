import { CompletionItem, CompletionItemKind } from 'vscode';
import { SuggestionProviders } from '@xml-tools/content-assist';
import IndexManager from 'indexer/IndexManager';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { XmlCompletionItemProvider } from './XmlCompletionItemProvider';

interface AttributeValueMatch {
  element?: string;
  attributeName: string;
}

interface ElementContentMatch {
  element?: string;
  attributeName?: string;
  attributeValue?: string;
}

export class NamespaceCompletionItemProvider extends XmlCompletionItemProvider {
  private static readonly ATTRIBUTE_VALUE_MATCHERS: AttributeValueMatch[] = [
    {
      element: 'preference',
      attributeName: 'for',
    },
    {
      element: 'preference',
      attributeName: 'type',
    },
    {
      element: 'type',
      attributeName: 'name',
    },
    {
      element: 'plugin',
      attributeName: 'type',
    },
    {
      element: 'virtualType',
      attributeName: 'type',
    },
    {
      attributeName: 'instance',
    },
    {
      attributeName: 'class',
    },
    {
      element: 'attribute',
      attributeName: 'type',
    },
    {
      element: 'extension_attributes',
      attributeName: 'for',
    },
    {
      element: 'consumer',
      attributeName: 'handler',
    },
    {
      element: 'queue',
      attributeName: 'handler',
    },
    {
      element: 'handler',
      attributeName: 'type',
    },
  ];

  private static readonly ELEMENT_CONTENT_MATCHERS: ElementContentMatch[] = [
    {
      attributeName: 'xsi:type',
      attributeValue: 'object',
    },
    {
      element: 'backend_model',
    },
    {
      element: 'frontend_model',
    },
    {
      element: 'source_model',
    },
  ];

  getFilePatterns(): string[] {
    return ['**/etc/**/*.xml'];
  }

  getCompletionProviders(): SuggestionProviders<CompletionItem> {
    return {
      attributeValue: [this.getAttributeValueCompletions.bind(this)],
      elementContent: [this.getElementContentCompletions.bind(this)],
    };
  }

  private getAttributeValueCompletions({
    element,
    attribute,
  }: {
    element: XMLElement;
    attribute: XMLAttribute;
  }): CompletionItem[] {
    const match = NamespaceCompletionItemProvider.ATTRIBUTE_VALUE_MATCHERS.find(matchElement => {
      if (matchElement.element && matchElement.element !== element.name) {
        return false;
      }

      return matchElement.attributeName === attribute.key;
    });

    if (!match) {
      return [];
    }

    const value = attribute?.value || '';
    return this.getCompletionItems(value);
  }

  private getElementContentCompletions({ element }: { element: XMLElement }): CompletionItem[] {
    const match = NamespaceCompletionItemProvider.ELEMENT_CONTENT_MATCHERS.find(matchElement => {
      if (matchElement.element && matchElement.element !== element.name) {
        return false;
      }

      if (matchElement.attributeName && matchElement.attributeValue) {
        return element.attributes.some(
          attribute =>
            attribute.key === matchElement.attributeName &&
            attribute.value === matchElement.attributeValue
        );
      }

      return true;
    });

    if (!match) {
      return [];
    }

    const elementContent =
      element.textContents.length > 0 ? (element.textContents[0].text ?? '') : '';

    return this.getCompletionItems(elementContent);
  }

  private getCompletionItems(prefix: string): CompletionItem[] {
    const namespaceIndexData = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

    if (!namespaceIndexData) {
      return [];
    }

    const completions = namespaceIndexData.findNamespacesByPrefix(prefix);

    return completions.map(namespace => {
      return new CompletionItem(namespace.fqn, CompletionItemKind.Value);
    });
  }
}
