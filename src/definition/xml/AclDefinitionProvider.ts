import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import AclIndexer from 'indexer/acl/AclIndexer';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';

export class AclDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
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
    return 'provideXmlDefinitions';
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): LocationLink[] {
    const aclIndexData = IndexManager.getIndexData(AclIndexer.KEY);

    if (!aclIndexData) {
      return [];
    }

    const acl = aclIndexData.getAcl(value);

    if (!acl) {
      return [];
    }

    const aclXmlUri = Uri.file(acl.path);

    return [
      {
        targetUri: aclXmlUri,
        targetRange: new Range(0, 0, 0, 0),
        originSelectionRange: range,
      },
    ];
  }
}
