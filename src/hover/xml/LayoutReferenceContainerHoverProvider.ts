import { Uri, Range, Hover, MarkdownString } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';

export class LayoutReferenceContainerHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceContainer'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range): Hover[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const containers = layoutIndexData.getContainersByName(value);

    if (!containers) {
      return [];
    }

    return containers.map(container => {
      const markdown = new MarkdownString();
      markdown.appendMarkdown(`**Container**: ${container.element.name}\n\n`);
      markdown.appendMarkdown(`- Theme: \`${container.layout.theme}\`\n\n`);

      if (container.element.after) {
        markdown.appendMarkdown(`- After: \`${container.element.after}\`\n\n`);
      }

      if (container.element.before) {
        markdown.appendMarkdown(`- Before: \`${container.element.before}\`\n\n`);
      }

      markdown.appendMarkdown(`[layout.xml](${Uri.file(container.layout.path)})`);

      return new Hover(markdown, range);
    });
  }
}
