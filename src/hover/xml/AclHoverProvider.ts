import { Hover, Uri, Range, TextDocument } from 'vscode';
import AclIndexer from 'indexer/acl/AclIndexer';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import HoverBuilder from 'hover/HoverBuilder';

export class AclHoverProvider extends XmlSuggestionProvider<Hover> {
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
    return 'provideXmlHovers';
  }

  public getFilePatterns(): string[] {
    return ['**/etc/acl.xml', '**/etc/webapi.xml', '**/etc/**/system.xml'];
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): Hover[] {
    const aclIndexData = IndexManager.getIndexData(AclIndexer.KEY);

    if (!aclIndexData) {
      return [];
    }

    const acl = aclIndexData.getAcl(value);

    if (!acl) {
      return [];
    }

    return [
      HoverBuilder.create()
        .title('ACL', acl.title)
        .property('ID', acl.id)
        .text(acl.description)
        .flag('Disabled', acl.disabled)
        .property('Sort Order', acl.sortOrder, false)
        .property('Parent ID', acl.parent)
        .link('acl.xml', Uri.file(acl.path))
        .build(range),
    ];
  }
}
