import { Hover, MarkdownString, Uri, Range, workspace, TextDocument } from 'vscode';
import AclIndexer from 'indexer/acl/AclIndexer';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { ParentElementNameMatches } from 'common/xml/suggestion/condition/ParentElementNameMatches';
import path from 'path';

export class ModuleHoverProvider extends XmlSuggestionProvider<Hover> {
  public getAttributeValueConditions(): CombinedCondition[] {
    return [
      [
        new ElementNameMatches('module'),
        new AttributeNameMatches('name'),
        new ParentElementNameMatches('sequence'),
      ],
      [
        new ElementNameMatches('module'),
        new AttributeNameMatches('name'),
        new ParentElementNameMatches('route'),
      ],
    ];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlHovers';
  }

  public getFilePatterns(): string[] {
    return ['**/etc/module.xml', '**/etc/**/routes.xml'];
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): Hover[] {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return [];
    }

    const module = moduleIndexData.getModule(value);

    if (!module) {
      return [];
    }

    const markdown = new MarkdownString();
    markdown.appendMarkdown(`**Module**: ${module.name}\n\n`);

    if (module.version) {
      markdown.appendMarkdown(`- Version: \`${module.version}\`\n\n`);
    }

    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
      return [];
    }

    const relativePath = path.relative(workspaceFolder.uri.fsPath, module.moduleXmlPath);

    markdown.appendMarkdown(`- Path: \`${relativePath}\`\n\n`);

    if (module.sequence) {
      markdown.appendMarkdown(`- Sequence: \n\n    - ${module.sequence.join('\n    - ')}\n\n`);
    }

    markdown.appendMarkdown(`[module.xml](${Uri.file(module.moduleXmlPath)})`);

    return [new Hover(markdown, range)];
  }
}
