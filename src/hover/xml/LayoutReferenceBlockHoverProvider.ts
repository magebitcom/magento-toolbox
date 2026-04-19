import { Uri, Range, Hover, MarkdownString } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import { WithLayout } from 'indexer/layout/types';
import { Block } from 'indexer/layout/types';

export class LayoutReferenceBlockHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceBlock'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range): Hover[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const blocks = layoutIndexData.getBlocksByName(value);

    if (!blocks) {
      return [];
    }

    return blocks.map((block: WithLayout<Block>) => {
      const markdown = new MarkdownString();
      markdown.appendMarkdown(`**Block**: ${block.element.name}\n\n`);
      markdown.appendMarkdown(`- Theme: \`${block.layout.theme}\`\n\n`);

      if (block.element.class) {
        markdown.appendMarkdown(`- Class: \`${block.element.class}\`\n\n`);
      }

      if (block.element.cacheable) {
        markdown.appendMarkdown(`- Cacheable: \`${block.element.cacheable}\`\n\n`);
      }

      if (block.element.as) {
        markdown.appendMarkdown(`- As: \`${block.element.as}\`\n\n`);
      }

      if (block.element.ttl) {
        markdown.appendMarkdown(`- TTL: \`${block.element.ttl}\`\n\n`);
      }

      if (block.element.group) {
        markdown.appendMarkdown(`- Group: \`${block.element.group}\`\n\n`);
      }

      if (block.element.acl) {
        markdown.appendMarkdown(`- ACL: \`${block.element.acl}\`\n\n`);
      }

      markdown.appendMarkdown(`[layout.xml](${Uri.file(block.layout.path)})`);

      return new Hover(markdown, range);
    });
  }
}
