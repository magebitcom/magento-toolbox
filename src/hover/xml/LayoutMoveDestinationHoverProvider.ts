import { Uri, Range, Hover, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import Magento from 'util/Magento';
import HoverBuilder from 'hover/HoverBuilder';

type Target = { path: string; theme: string; kind: 'block' | 'container' };

export class LayoutMoveDestinationHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('move'), new AttributeNameMatches('destination')]];
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
      for (const { layout } of layoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: layout.path, theme: layout.theme, kind: 'block' });
      }
      for (const { layout } of layoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: layout.path, theme: layout.theme, kind: 'container' });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout } of pageLayoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: pageLayout.path, theme: '-', kind: 'block' });
      }
      for (const { pageLayout } of pageLayoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: pageLayout.path, theme: '-', kind: 'container' });
      }
    }

    if (targets.length === 0) {
      return [];
    }

    const kinds = new Set(targets.map(t => t.kind));

    return [
      HoverBuilder.create()
        .title('Move destination', value)
        .property('Resolves to', Array.from(kinds).join(', '))
        .links(
          'Defined in',
          targets.map(target => ({
            label: `${target.kind} in ${target.theme}`,
            uri: Uri.file(target.path),
          }))
        )
        .build(range),
    ];
  }
}
