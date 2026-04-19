import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import FileSystem from 'util/FileSystem';
import RangeUtil from 'util/Range';
import Magento from 'util/Magento';

type Target = { path: string; elementName: string; kind: 'block' | 'container' };

export class LayoutMoveDestinationDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('move'), new AttributeNameMatches('destination')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument
  ): Promise<LocationLink>[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    const area = Magento.getLayoutArea(document.uri.fsPath);

    const targets: Target[] = [];

    if (layoutIndexData) {
      for (const { layout, element } of layoutIndexData.getBlocksByName(value, area)) {
        if (element.name) {
          targets.push({ path: layout.path, elementName: element.name, kind: 'block' });
        }
      }
      for (const { layout, element } of layoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: layout.path, elementName: element.name, kind: 'container' });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout, element } of pageLayoutIndexData.getBlocksByName(value, area)) {
        if (element.name) {
          targets.push({ path: pageLayout.path, elementName: element.name, kind: 'block' });
        }
      }
      for (const { pageLayout, element } of pageLayoutIndexData.getContainersByName(value, area)) {
        targets.push({ path: pageLayout.path, elementName: element.name, kind: 'container' });
      }
    }

    return targets.map(target => this.mapTarget(target, range));
  }

  private async mapTarget(target: Target, originSelectionRange: Range): Promise<LocationLink> {
    const uri = Uri.file(target.path);
    const content = await FileSystem.readFile(uri);
    const regex = new RegExp(`${target.kind}[^>]*name="${target.elementName}"`, 's');
    const targetRange = RangeUtil.fileRegexToVsCodeRange(regex, content);
    return {
      targetUri: uri,
      targetRange,
      originSelectionRange,
    };
  }
}
