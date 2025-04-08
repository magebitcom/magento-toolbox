import { minimatch } from 'minimatch';
import * as vscode from 'vscode';

interface Snippet {
  prefix: string;
  body: string[];
  description: string;
}

interface SnippetProvider {
  pattern: string;
  snippets: Record<string, Snippet>;
}

export class XmlSnippetProvider implements vscode.CompletionItemProvider {
  public static readonly TRIGGER_CHARACTERS = ['<'];

  private readonly snippetProviders: SnippetProvider[] = [
    {
      pattern: '**/di.xml',
      snippets: require('./xml/snippet/di-xml.json'),
    },
  ];

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const snippets = this.getSnippets(document);

    if (!snippets) {
      return null;
    }

    const completionItems: vscode.CompletionItem[] = [];

    for (const name in snippets) {
      const snippet = snippets[name];

      const completionItem = new vscode.CompletionItem(
        {
          label: name,
          detail: ' magento-toolbox',
        },
        vscode.CompletionItemKind.Snippet
      );

      const snippetString = new vscode.SnippetString(snippet.body.join('\n'));
      completionItem.insertText = snippetString;
      completionItem.documentation = new vscode.MarkdownString(snippet.description);
      completionItem.additionalTextEdits = [
        vscode.TextEdit.delete(
          new vscode.Range(position.line, position.character - 1, position.line, position.character)
        ),
      ];

      completionItems.push(completionItem);
    }

    return completionItems;
  }

  public getSnippets(document: vscode.TextDocument): Record<string, Snippet> | undefined {
    for (const snippetProvider of this.snippetProviders) {
      if (minimatch(document.uri.fsPath, snippetProvider.pattern, { matchBase: true })) {
        return snippetProvider.snippets;
      }
    }

    return undefined;
  }
}
