import { minimatch } from 'minimatch';
import { CompletionItem, Position, TextDocument, Range } from 'vscode';
import { getSuggestions, SuggestionProviders } from '@xml-tools/content-assist';
import { TokenData } from 'common/xml/XmlDocumentParser';
import Config from 'common/Config';

export abstract class XmlCompletionItemProvider {
  public abstract getFilePatterns(): string[];
  public abstract getCompletionProviders(): SuggestionProviders<CompletionItem>;

  public async getCompletions(
    document: TextDocument,
    position: Position,
    tokenData: TokenData
  ): Promise<CompletionItem[]> {
    const offset = document.offsetAt(position);

    const completions = getSuggestions({
      ...tokenData,
      offset,
      providers: this.getCompletionProviders(),
    });

    return this.fixCompletionItemRanges(document, position, completions);
  }

  private fixCompletionItemRanges(
    document: TextDocument,
    position: Position,
    completions: CompletionItem[]
  ): CompletionItem[] {
    const range = document.getWordRangeAtPosition(position, /("[^"]+")|(>[^<]+<)/);

    if (range) {
      const rangeWithoutQuotes = new Range(
        range.start.with({ character: range.start.character + 1 }),
        range.end.with({ character: range.end.character - 1 })
      );

      for (const completion of completions) {
        completion.range = rangeWithoutQuotes;
      }
    }

    return completions;
  }

  public canProvideCompletion(document: TextDocument): boolean {
    const provideXmlCompletions = Config.get<boolean>('provideXmlCompletions');

    if (!provideXmlCompletions) {
      return false;
    }

    return this.getFilePatterns().some(pattern =>
      minimatch(document.uri.fsPath, pattern, { matchBase: true })
    );
  }
}
