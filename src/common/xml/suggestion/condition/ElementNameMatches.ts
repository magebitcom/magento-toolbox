import { XMLElement } from '@xml-tools/ast';
import { MatchCondition } from './MatchCondition';

export class ElementNameMatches implements MatchCondition {
  public constructor(private readonly elementName: string) {}

  public match(element: XMLElement): boolean {
    return element.name === this.elementName;
  }
}
