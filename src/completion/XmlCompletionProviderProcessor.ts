import { CompletionItemProvider } from 'vscode';

import { XmlSuggestionProviderProcessor } from 'common/xml/XmlSuggestionProviderProcessor';
import { CompletionItem, Position, TextDocument } from 'vscode';

import { CancellationToken } from 'vscode';
import { ModuleCompletionProvider } from './xml/ModuleCompletionProvider';
import { NamespaceCompletionProvider } from './xml/NamespaceCompletionProvider';
import { AclCompletionProvider } from './xml/AclCompletionProvider';

export class XmlCompletionProviderProcessor
  extends XmlSuggestionProviderProcessor<CompletionItem>
  implements CompletionItemProvider
{
  public constructor() {
    super([
      new ModuleCompletionProvider(),
      new NamespaceCompletionProvider(),
      new AclCompletionProvider(),
    ]);
  }

  public async provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<CompletionItem[]> {
    return this.provideSuggestions(document, position, token);
  }
}
