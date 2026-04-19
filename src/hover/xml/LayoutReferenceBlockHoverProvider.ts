import { Uri, Range, Hover, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import { Block } from 'indexer/layout/types';
import Magento from 'util/Magento';
import HoverBuilder from 'hover/HoverBuilder';

type BlockHoverTarget = { path: string; theme: string; block: Block };

export class LayoutReferenceBlockHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceBlock'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): Hover[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    const area = Magento.getLayoutArea(document.uri.fsPath);

    const targets: BlockHoverTarget[] = [];

    if (layoutIndexData) {
      for (const { layout, element } of layoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: layout.path, theme: layout.theme, block: element });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout, element } of pageLayoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: pageLayout.path, theme: '-', block: element });
      }
    }

    return targets.map(target =>
      HoverBuilder.create()
        .title('Block', target.block.name)
        .property('Theme', target.theme)
        .property('Class', target.block.class)
        .property('Cacheable', target.block.cacheable)
        .property('As', target.block.as)
        .property('TTL', target.block.ttl)
        .property('Group', target.block.group)
        .property('ACL', target.block.acl)
        .link('layout.xml', Uri.file(target.path))
        .build(range)
    );
  }
}
