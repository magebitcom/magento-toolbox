import {
  CancellationToken,
  DefinitionProvider,
  LocationLink,
  Position,
  TextDocument,
} from 'vscode';
import { XmlSuggestionProviderProcessor } from 'common/xml/XmlSuggestionProviderProcessor';
import { AclDefinitionProvider } from './xml/AclDefinitionProvider';
import { ModuleDefinitionProvider } from './xml/ModuleDefinitionProvider';
import { TemplateDefinitionProvider } from './xml/TemplateDefinitionProvider';
import { ThemeDefinitionProvider } from './xml/ThemeDefinitionProvider';

export class XmlDefinitionProviderProcessor
  extends XmlSuggestionProviderProcessor<LocationLink>
  implements DefinitionProvider
{
  public constructor() {
    super([
      new AclDefinitionProvider(),
      new ModuleDefinitionProvider(),
      new TemplateDefinitionProvider(),
      new ThemeDefinitionProvider(),
    ]);
  }

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<LocationLink[]> {
    const definitions = await this.provideSuggestions(document, position, token);
    return definitions.filter(definition => definition.targetUri.fsPath !== document.uri.fsPath);
  }
}
