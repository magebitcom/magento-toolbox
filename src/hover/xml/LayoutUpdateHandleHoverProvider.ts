import { Uri, Range, Hover, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import Magento from 'util/Magento';
import HoverBuilder from 'hover/HoverBuilder';

export class LayoutUpdateHandleHoverProvider extends XmlSuggestionProvider<Hover> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('update'), new AttributeNameMatches('handle')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): Hover[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const area = Magento.getLayoutArea(document.uri.fsPath);
    const layouts = layoutIndexData.getLayoutsByHandle(value, area);

    if (layouts.length === 0) {
      return [];
    }

    return [
      HoverBuilder.create()
        .title('Handle', value)
        .property('Declarations', layouts.length, false)
        .links(
          'Defined in',
          layouts.map(layout => ({ label: layout.theme, uri: Uri.file(layout.path) }))
        )
        .build(range),
    ];
  }
}
