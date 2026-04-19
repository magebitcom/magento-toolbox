import { LocationLink, Uri, Range } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import { XmlSuggestionProvider, CombinedCondition } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import { AttributeNameMatches } from 'common/xml/suggestion/condition/AttributeNameMatches';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import { MagentoScope } from 'types/global';
import { Container, WithLayout } from 'indexer/layout/types';
import FileSystem from 'util/FileSystem';
import RangeUtil from 'util/Range';

export class LayoutReferenceContainerDefinitionProvider extends XmlSuggestionProvider<LocationLink> {
  public getFilePatterns(): string[] {
    return ['**/layout/*.xml', '**/page_layout/*.xml'];
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [[new ElementNameMatches('referenceContainer'), new AttributeNameMatches('name')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideLayoutDefinitions';
  }

  public getSuggestionItems(value: string, range: Range): Promise<LocationLink>[] {
    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);

    if (!layoutIndexData) {
      return [];
    }

    const containers = layoutIndexData.getContainersByName(value, MagentoScope.Frontend);

    if (!containers) {
      return [];
    }

    return containers.map(container => this.mapContainer(container, range));
  }

  private async mapContainer(
    container: WithLayout<Container>,
    originSelectionRange: Range
  ): Promise<LocationLink> {
    const range = await this.getTargetRange(container);
    return {
      targetUri: Uri.file(container.layout.path),
      targetRange: range,
      originSelectionRange,
    };
  }

  private async getTargetRange(container: WithLayout<Container>): Promise<Range> {
    const uri = Uri.file(container.layout.path);
    const content = await FileSystem.readFile(uri);
    const regex = new RegExp(`container[^>]*name="${container.element.name}"`, 's');
    return RangeUtil.fileRegexToVsCodeRange(regex, content);
  }
}
