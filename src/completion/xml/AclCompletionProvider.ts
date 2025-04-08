import { TextDocument, CompletionItem, CompletionItemKind, Range } from 'vscode';
import AclIndexer from 'indexer/acl/AclIndexer';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';

export class AclCompletionProvider extends XmlSuggestionProvider<CompletionItem> {
  public getFilePatterns(): string[] {
    return ['**/etc/acl.xml', '**/etc/webapi.xml', '**/etc/**/system.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [
      [new ElementNameMatches('resource'), new AttributeNameMatches('id')],
      [new ElementNameMatches('resource'), new AttributeNameMatches('ref')],
    ];
  }

  public getElementContentMatches(): CombinedCondition[] {
    return [[new ElementNameMatches('resource')]];
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
    const aclIndexData = IndexManager.getIndexData(AclIndexer.KEY);

    if (!aclIndexData) {
      return [];
    }

    const acls = aclIndexData.getAclsByPrefix(value);

    if (!acls) {
      return [];
    }

    return acls.map(acl => {
      const item = new CompletionItem(acl.id, CompletionItemKind.Value);
      item.range = range;
      return item;
    });
  }
}
