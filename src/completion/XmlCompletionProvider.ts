import { minimatch } from 'minimatch';
import {
  CancellationToken,
  CompletionItem,
  CompletionItemProvider,
  CompletionList,
  Position,
  TextDocument,
  Range,
} from 'vscode';
import { getSuggestions, SuggestionProviders } from '@xml-tools/content-assist';
import XmlDocumentParser, { TokenData } from 'common/xml/XmlDocumentParser';
import Config from 'common/Config';
import { ModuleCompletionItemProvider } from './xml/ModuleCompletionItemProvider';
import { NamespaceCompletionItemProvider } from './xml/NamespaceCompletionItemProvider';
import { XmlCompletionItemProvider } from './xml/XmlCompletionItemProvider';

export class XmlCompletionProvider implements CompletionItemProvider {
  private readonly providers: XmlCompletionItemProvider[];

  public constructor() {
    this.providers = [new ModuleCompletionItemProvider(), new NamespaceCompletionItemProvider()];
  }

  public async provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<CompletionItem[]> {
    if (!this.providers.some(provider => provider.canProvideCompletion(document))) {
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

  private async getProviderCompletionItems(
    provider: XmlCompletionItemProvider,
    document: TextDocument,
    position: Position,
    tokenData: TokenData
  ): Promise<CompletionItem[]> {
    if (!provider.canProvideCompletion(document)) {
      return [];
    }

    return provider.getCompletions(document, position, tokenData);
  }
}
