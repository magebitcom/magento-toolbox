import { XMLElement } from '@xml-tools/ast';
import { MatchCondition } from './MatchCondition';

export class ParentElementNameMatches implements MatchCondition {
  public constructor(private readonly elementName: string) {}

  public match(element: XMLElement): boolean {
    if (element.parent.type === 'XMLElement') {
      return element.parent.name === this.elementName;
    }

    return false;
  }
}
