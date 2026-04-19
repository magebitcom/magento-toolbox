import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import Magento from 'util/Magento';

export class LayoutUpdateHandleDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('update'), new AttributeNameMatches('handle')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range, document: TextDocument): LocationLink[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const area = Magento.getLayoutArea(document.uri.fsPath);
    const layouts = layoutIndexData.getLayoutsByHandle(value, area);

    return layouts.map(layout => ({
      targetUri: Uri.file(layout.path),
      targetRange: new Range(0, 0, 0, 0),
      originSelectionRange: range,
    }));
  }
}
