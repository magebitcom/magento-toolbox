import { Uri, Range, Hover, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import { Block, Container } from 'indexer/layout/types';
import Magento from 'util/Magento';
import HoverBuilder from 'hover/HoverBuilder';

type BlockTarget = { kind: 'block'; path: string; theme: string; block: Block };
type ContainerTarget = { kind: 'container'; path: string; theme: string; container: Container };
type Target = BlockTarget | ContainerTarget;

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

    const targets: Target[] = [];

    if (layoutIndexData) {
      for (const { layout, element } of layoutIndexData.getBlocksByName(value, area)) {
        targets.push({ kind: 'block', path: layout.path, theme: layout.theme, block: element });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout, element } of pageLayoutIndexData.getBlocksByName(value, area)) {
        targets.push({ kind: 'block', path: pageLayout.path, theme: '-', block: element });
      }
    }

    if (targets.length === 0) {
      if (layoutIndexData) {
        for (const { layout, element } of layoutIndexData.getContainersByName(value, area)) {
          targets.push({
            kind: 'container',
            path: layout.path,
            theme: layout.theme,
            container: element,
          });
        }
      }

      if (pageLayoutIndexData) {
        for (const { pageLayout, element } of pageLayoutIndexData.getContainersByName(
          value,
          area
        )) {
          targets.push({
            kind: 'container',
            path: pageLayout.path,
            theme: '-',
            container: element,
          });
        }
      }
    }

    return targets.map(target => this.render(target, range));
  }

  private render(target: Target, range: Range): Hover {
    if (target.kind === 'block') {
      return HoverBuilder.create()
        .title('Block', target.block.name)
        .property('Theme', target.theme)
        .property('Class', target.block.class)
        .property('Cacheable', target.block.cacheable)
        .property('As', target.block.as)
        .property('TTL', target.block.ttl)
        .property('Group', target.block.group)
        .property('ACL', target.block.acl)
        .link('layout.xml', Uri.file(target.path))
        .build(range);
    }

    return HoverBuilder.create()
      .title('Container', target.container.name)
      .property('Theme', target.theme)
      .property('Label', target.container.label)
      .property('HTML Tag', target.container.htmlTag)
      .property('After', target.container.after)
      .property('Before', target.container.before)
      .link('layout.xml', Uri.file(target.path))
      .build(range);
  }
}
