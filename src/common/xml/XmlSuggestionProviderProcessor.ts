import { CancellationToken, Position, TextDocument } from 'vscode';
import XmlDocumentParser, { TokenData } from 'common/xml/XmlDocumentParser';
import { XmlSuggestionProvider } from './XmlSuggestionProvider';

export abstract class XmlSuggestionProviderProcessor<T> {
  public constructor(private providers: XmlSuggestionProvider<T>[]) {}

  public async provideSuggestions(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<T[]> {
    if (!this.providers.some(provider => provider.canProvideSuggestions(document))) {
      return [];
    }

    const tokenData = await XmlDocumentParser.parse(document, true);

    const providerCompletionItems = await Promise.all(
      this.providers.map(provider =>
        this.getProviderCompletionItems(provider, document, position, tokenData)
      )
    );

    return providerCompletionItems.flat();
  }

  protected async getProviderCompletionItems(
    provider: XmlSuggestionProvider<T>,
    document: TextDocument,
    position: Position,
    tokenData: TokenData
  ): Promise<T[]> {
    if (!provider.canProvideSuggestions(document)) {
      return [];
    }

    return provider.provideSuggestions(document, position, tokenData);
  }
}
