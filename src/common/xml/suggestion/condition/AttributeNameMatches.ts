import { XMLAttribute, XMLElement } from '@xml-tools/ast';
import { MatchCondition } from './MatchCondition';

export class AttributeNameMatches implements MatchCondition {
  public constructor(private readonly attributeName: string) {}

  public match(element: XMLElement, attribute?: XMLAttribute): boolean {
    if (!attribute) {
      return false;
    }

    return attribute.key === this.attributeName;
  }
}
