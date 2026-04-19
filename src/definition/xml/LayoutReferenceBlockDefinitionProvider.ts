import { LocationLink, Uri, Range } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import { MagentoScope } from 'types/global';
import { Block, WithLayout } from 'indexer/layout/types';
import FileSystem from 'util/FileSystem';
import RangeUtil from 'util/Range';

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

  public getSuggestionItems(value: string, range: Range): Promise<LocationLink>[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const blocks = layoutIndexData.getBlocksByName(value, MagentoScope.Frontend);

    if (!blocks) {
      return [];
    }

    return blocks.map(block => this.mapBlock(block, range));
  }

  private async mapBlock(
    block: WithLayout<Block>,
    originSelectionRange: Range
  ): Promise<LocationLink> {
    const range = await this.getTargetRange(block);
    return {
      targetUri: Uri.file(block.layout.path),
      targetRange: range,
      originSelectionRange,
    };
  }

  private async getTargetRange(block: WithLayout<Block>): Promise<Range> {
    const uri = Uri.file(block.layout.path);
    const content = await FileSystem.readFile(uri);
    const regex = new RegExp(`block[^>]*name="${block.element.name}"`, 's');
    return RangeUtil.fileRegexToVsCodeRange(regex, content);
  }
}
