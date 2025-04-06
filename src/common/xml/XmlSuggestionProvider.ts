import { minimatch } from 'minimatch';
import { Position, TextDocument, Range } from 'vscode';
import {
  getSuggestions,
  SuggestionProviders,
  AttributeValueCompletionOptions,
  ElementContentCompletionOptions,
} from '@xml-tools/content-assist';
import Config from 'common/Config';
import { TokenData } from 'common/xml/XmlDocumentParser';
import { XMLElement } from '@xml-tools/ast';
import { XMLAttribute } from '@xml-tools/ast';
import { MatchCondition } from './suggestion/condition/MatchCondition';

export type CombinedCondition = MatchCondition[];

export abstract class XmlSuggestionProvider<T> {
  public abstract getFilePatterns(): string[];
  public abstract getSuggestionItems(
    value: string,
    range: Range,
    document: TextDocument,
    element: XMLElement,
    attribute?: XMLAttribute
  ): T[];

  public getConfigKey(): string | undefined {
    return undefined;
  }

  public getAttributeValueConditions(): CombinedCondition[] {
    return [];
  }

  public getElementContentMatches(): CombinedCondition[] {
    return [];
  }

  public async provideSuggestions(
    document: TextDocument,
    position: Position,
    tokenData: TokenData
  ): Promise<T[]> {
    if (!this.canProvideSuggestions(document)) {
      return [];
    }

    return this.processSuggestions(document, position, tokenData);
  }

  public getSuggestionProviders(document: TextDocument): SuggestionProviders<T> {
    return {
      attributeValue: [options => this.getAttributeValueSuggestionProviders(document, options)],
      elementContent: [options => this.getElementContentSuggestionProviders(document, options)],
    };
  }

  public getAttributeValueSuggestionProviders(
    document: TextDocument,
    { element, attribute }: AttributeValueCompletionOptions<undefined>
  ): T[] {
    const match = this.getAttributeValueConditions().find(matchElement => {
      return this.matchesConditions(matchElement, element, attribute);
    });

    if (!match) {
      return [];
    }

    const value = attribute?.value || '';

    const range = attribute
      ? new Range(
          attribute.position.startLine - 1,
          attribute.position.startColumn + 1 + (attribute.key?.length ?? 0),
          attribute.position.endLine - 1,
          attribute.position.endColumn - 1
        )
      : new Range(0, 0, 0, 0);

    return this.getSuggestionItems(value, range, document, element, attribute);
  }

  public getElementContentSuggestionProviders(
    document: TextDocument,
    { element }: ElementContentCompletionOptions<undefined>
  ): T[] {
    const match = this.getElementContentMatches().find(matchElement => {
      return this.matchesConditions(matchElement, element);
    });

    if (!match) {
      return [];
    }

    const textContents = element.textContents.length > 0 ? element.textContents[0] : null;
    const elementValue = textContents?.text ?? '';

    const range = textContents
      ? new Range(
          textContents.position.startLine - 1,
          textContents.position.startColumn - 1,
          textContents.position.endLine - 1,
          textContents.position.endColumn
        )
      : new Range(0, 0, 0, 0);

    return this.getSuggestionItems(elementValue, range, document, element);
  }

  protected matchesConditions(
    conditions: CombinedCondition,
    element: XMLElement,
    attribute?: XMLAttribute
  ): boolean {
    return conditions.every(condition => condition.match(element, attribute));
  }

  protected processSuggestions(
    document: TextDocument,
    position: Position,
    tokenData: TokenData
  ): T[] {
    const suggestions = getSuggestions({
      ...tokenData,
      offset: document.offsetAt(position),
      providers: this.getSuggestionProviders(document),
    });

    return suggestions;
  }

  public canProvideSuggestions(document: TextDocument): boolean {
    if (this.getConfigKey()) {
      const provideXmlSuggestions = Config.get<boolean>(this.getConfigKey()!);

      if (!provideXmlSuggestions) {
        return false;
      }
    }

    return this.getFilePatterns().some(pattern =>
      minimatch(document.uri.fsPath, pattern, { matchBase: true })
    );
  }
}
