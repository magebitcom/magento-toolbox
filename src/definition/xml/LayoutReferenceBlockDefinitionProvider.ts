import { LocationLink, Uri, Range, TextDocument } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import { Block } from 'indexer/layout/types';
import FileSystem from 'util/FileSystem';
import RangeUtil from 'util/Range';
import Magento from 'util/Magento';

type BlockTarget = { path: string; block: Block };

export class LayoutReferenceBlockDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceBlock'), new AttributeNameMatches('name')]];
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

    const targets: BlockTarget[] = [];

    if (layoutIndexData) {
      for (const { layout, element } of layoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: layout.path, block: element });
      }
    }

    if (pageLayoutIndexData) {
      for (const { pageLayout, element } of pageLayoutIndexData.getBlocksByName(value, area)) {
        targets.push({ path: pageLayout.path, block: element });
      }
    }

    return targets.map(target => this.mapBlock(target, range));
  }

  private async mapBlock(target: BlockTarget, originSelectionRange: Range): Promise<LocationLink> {
    const targetRange = await this.getTargetRange(target);
    return {
      targetUri: Uri.file(target.path),
      targetRange,
      originSelectionRange,
    };
  }

  private async getTargetRange(target: BlockTarget): Promise<Range> {
    const uri = Uri.file(target.path);
    const content = await FileSystem.readFile(uri);
    const regex = new RegExp(`block[^>]*name="${target.block.name}"`, 's');
    return RangeUtil.fileRegexToVsCodeRange(regex, content);
  }
}
