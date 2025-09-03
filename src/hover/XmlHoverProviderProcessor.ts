import { CancellationToken, Hover, Position, TextDocument } from 'vscode';
import { XmlSuggestionProviderProcessor } from 'common/xml/XmlSuggestionProviderProcessor';
import { AclHoverProvider } from 'hover/xml/AclHoverProvider';
import { ModuleHoverProvider } from 'hover/xml/ModuleHoverProvider';
import { CronHoverProvider } from 'hover/xml/CronHoverProvider';
import { ThemeHoverProvider } from 'hover/xml/ThemeHoverProvider';

export class XmlHoverProviderProcessor extends XmlSuggestionProviderProcessor<Hover> {
  public constructor() {
    super([
      new AclHoverProvider(),
      new ModuleHoverProvider(),
      new CronHoverProvider(),
      new ThemeHoverProvider(),
    ]);
  }

  public async provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Hover | null> {
    const suggestions = await this.provideSuggestions(document, position, token);

    const suggestion = suggestions.length > 0 ? suggestions[0] : null;

    if (!suggestion) {
      return null;
    }

    return suggestion;
  }
}
