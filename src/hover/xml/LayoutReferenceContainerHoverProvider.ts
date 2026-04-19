import { Uri, Range, Hover, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import { Container } from 'indexer/layout/types';
import Magento from 'util/Magento';
import HoverBuilder from 'hover/HoverBuilder';

type ContainerHoverTarget = { path: string; theme: string; container: Container };

export class LayoutReferenceContainerHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceContainer'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): Hover[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    const area = Magento.getLayoutArea(document.uri.fsPath);

    const targets: ContainerHoverTarget[] = [];

    if (layoutIndexData) {
      for (const { layout, element } of layoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: layout.path, theme: layout.theme, container: element });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout, element } of pageLayoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: pageLayout.path, theme: '-', container: element });
      }
    }

    return targets.map(target =>
      HoverBuilder.create()
        .title('Container', target.container.name)
        .property('Theme', target.theme)
        .property('Label', target.container.label)
        .property('HTML Tag', target.container.htmlTag)
        .property('After', target.container.after)
        .property('Before', target.container.before)
        .link('layout.xml', Uri.file(target.path))
        .build(range)
    );
  }
}
