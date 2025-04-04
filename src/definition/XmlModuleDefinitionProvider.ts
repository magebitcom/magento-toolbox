import { AttributeValueCompletionOptions, SuggestionProviders } from '@xml-tools/content-assist';
import { XmlDefinitionProvider } from './XmlDefinitionProvider';
import { LocationLink, Uri, Range } from 'vscode';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import IndexManager from 'indexer/IndexManager';

export class XmlModuleDefinitionProvider extends XmlDefinitionProvider {
  public getFilePatterns(): string[] {
    return ['**/etc/module.xml', '**/etc/**/routes.xml'];
  }

  public getDefinitionProviders(): SuggestionProviders<LocationLink> {
    return {
      attributeValue: [this.getModuleDefinitions],
    };
  }

  private getModuleDefinitions({
    element,
    attribute,
  }: AttributeValueCompletionOptions<undefined>): LocationLink[] {
    if (element.name !== 'module' || attribute.key !== 'name') {
      return [];
    }

    const moduleName = attribute.value;

    if (!moduleName) {
      return [];
    }

    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return [];
    }

    const module = moduleIndexData.getModule(moduleName);

    if (!module) {
      return [];
    }

    const moduleXmlUri = Uri.file(module.moduleXmlPath);

    return [
      {
        targetUri: moduleXmlUri,
        targetRange: new Range(0, 0, 0, 0),
        originSelectionRange: new Range(
          attribute.position.startLine - 1,
          attribute.position.startColumn + 5,
          attribute.position.endLine - 1,
          attribute.position.endColumn - 1
        ),
      },
    ];
  }
}
