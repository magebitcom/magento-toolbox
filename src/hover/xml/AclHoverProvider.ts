import { Hover, MarkdownString, Uri, Range, TextDocument } from 'vscode';
import AclIndexer from 'indexer/acl/AclIndexer';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';

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

    const markdown = new MarkdownString();
    markdown.appendMarkdown(`**ACL**: ${acl.title}\n\n`);
    markdown.appendMarkdown(`- ID: \`${acl.id}\`\n\n`);

    if (acl.description) {
      markdown.appendMarkdown(`${acl.description}\n\n`);
    }

    if (acl.disabled) {
      markdown.appendMarkdown(`- **Disabled**\n\n`);
    }

    if (acl.sortOrder) {
      markdown.appendMarkdown(`- Sort Order: ${acl.sortOrder}\n\n`);
    }

    if (acl.parent) {
      markdown.appendMarkdown(`- Parent ID: \`${acl.parent}\`\n\n`);
    }

    markdown.appendMarkdown(`[acl.xml](${Uri.file(acl.path)})`);

    return [new Hover(markdown, range)];
  }
}
