import { last, uniq } from 'lodash-es';
import { minimatch } from 'minimatch';
import * as vscode from 'vscode';

interface Snippet {
  prefix: string;
  body: string[];
  description: string;
  parent?: string | string[] | null;
}

interface SnippetProvider {
  pattern: string;
  snippets: Record<string, Snippet>;
}

export class XmlSnippetProvider implements vscode.CompletionItemProvider {
  public static readonly TRIGGER_CHARACTERS = ['<'];

  private readonly snippetProviders: SnippetProvider[] = [
    {
      pattern: '**/acl.xml',
      snippets: require('./xml/snippet/acl.json'),
    },
    {
      pattern: '**/extension-attributes.xml',
      snippets: require('./xml/snippet/extension-attributes.json'),
    },
    {
      pattern: '**/fieldset.xml',
      snippets: require('./xml/snippet/fieldset.json'),
    },
    {
      pattern: '**/di.xml',
      snippets: require('./xml/snippet/di.json'),
    },
    {
      pattern: '**/events.xml',
      snippets: require('./xml/snippet/events.json'),
    },
    {
      pattern: '**/crontab.xml',
      snippets: require('./xml/snippet/crontab.json'),
    },
    {
      pattern: '**/webapi.xml',
      snippets: require('./xml/snippet/webapi.json'),
    },
    {
      pattern: '**/system.xml',
      snippets: require('./xml/snippet/system.json'),
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

    const parentElementNames = this.getParentElementNames(document, position);
    const directParentName = last(parentElementNames);
    const completionItems: vscode.CompletionItem[] = [];

    for (const name in snippets) {
      const snippet = snippets[name];

      if (snippet.parent === null && directParentName) {
        continue;
      }

      if (snippet.parent) {
        if (Array.isArray(snippet.parent)) {
          if (!snippet.parent.includes(directParentName || '')) {
            continue;
          }
        } else if (snippet.parent !== directParentName) {
          continue;
        }
      }

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

  private getParentElementNames(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string[] {
    const text = document.getText(new vscode.Range(0, 0, position.line, position.character));
    // Match all opening elements except for self-closing ones
    const openingElementMatches = text.matchAll(/<([:_a-zA-Z]+)[^<]*(?<!\/)>/gms);
    // Match all closing elements
    const closingElementMatches = text.matchAll(/<\/([:_a-zA-Z]+)>/g);

    if (!openingElementMatches || !closingElementMatches) {
      return [];
    }

    const openingElementNames = Array.from(openingElementMatches).map(match => match[1]);
    const closingElementNames = Array.from(closingElementMatches).map(match => match[1]);

    const openingElementCount = openingElementNames.reduce(
      (acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const closingElementCount = closingElementNames.reduce(
      (acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return uniq(
      openingElementNames.filter(name => {
        return openingElementCount[name] > (closingElementCount[name] || 0);
      })
    );
  }
}
