import { minimatch } from 'minimatch';
import {
  CancellationToken,
  DefinitionProvider,
  LocationLink,
  Position,
  TextDocument,
} from 'vscode';
import { getSuggestions, SuggestionProviders } from '@xml-tools/content-assist';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';

export abstract class XmlDefinitionProvider implements DefinitionProvider {
  public abstract getFilePatterns(): string[];
  public abstract getDefinitionProviders(): SuggestionProviders<LocationLink>;

  public async provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<LocationLink[]> {
    if (!this.canProvideDefinition(document)) {
      return [];
    }

    const { cst, tokenVector, ast } = await XmlDocumentParser.parse(document);

    const definitions = getSuggestions({
      ast,
      cst,
      tokenVector,
      offset: document.offsetAt(position),
      providers: this.getDefinitionProviders(),
    });

    return definitions.filter(definition => definition.targetUri.fsPath !== document.uri.fsPath);
  }

  private canProvideDefinition(document: TextDocument): boolean {
    return this.getFilePatterns().some(pattern =>
      minimatch(document.uri.fsPath, pattern, { matchBase: true })
    );
  }
}
