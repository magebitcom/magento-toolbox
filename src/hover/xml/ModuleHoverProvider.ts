import { Hover, Uri, Range, workspace, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { XMLElement, XMLAttribute } from '@xml-tools/ast';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { ParentElementNameMatches } from 'common/xml/suggestion/condition/ParentElementNameMatches';
import path from 'path';
import HoverBuilder from 'hover/HoverBuilder';

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

    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);

    if (!workspaceFolder) {
      return [];
    }

    const relativePath = path.relative(workspaceFolder.uri.fsPath, module.moduleXmlPath);

    return [
      HoverBuilder.create()
        .title('Module', module.name)
        .property('Version', module.version)
        .property('Path', relativePath)
        .list('Sequence', module.sequence ?? [])
        .link('module.xml', Uri.file(module.moduleXmlPath))
        .build(range),
    ];
  }
}
