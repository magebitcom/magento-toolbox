import { CompletionItemProvider } from 'vscode';

import { XmlSuggestionProviderProcessor } from 'common/xml/XmlSuggestionProviderProcessor';
import { CompletionItem, Position, TextDocument } from 'vscode';

import { CancellationToken } from 'vscode';
import { ModuleCompletionProvider } from './xml/ModuleCompletionProvider';
import { NamespaceCompletionProvider } from './xml/NamespaceCompletionProvider';
import { AclCompletionProvider } from './xml/AclCompletionProvider';
import { TemplateCompletionProvider } from './xml/TemplateCompletionProvider';
import { EventCompletionProvider } from './xml/EventCompletionProvider';
import { LayoutBlockNameCompletionProvider } from './xml/LayoutBlockNameCompletionProvider';
import { LayoutContainerNameCompletionProvider } from './xml/LayoutContainerNameCompletionProvider';
import { LayoutUpdateHandleCompletionProvider } from './xml/LayoutUpdateHandleCompletionProvider';

export class XmlCompletionProviderProcessor
  extends XmlSuggestionProviderProcessor<CompletionItem>
  implements CompletionItemProvider
{
  public constructor() {
    super([
      new ModuleCompletionProvider(),
      new NamespaceCompletionProvider(),
      new AclCompletionProvider(),
      new TemplateCompletionProvider(),
      new EventCompletionProvider(),
      new LayoutBlockNameCompletionProvider(),
      new LayoutContainerNameCompletionProvider(),
      new LayoutUpdateHandleCompletionProvider(),
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
