import { XMLElement } from '@xml-tools/ast';
import { MatchCondition } from './MatchCondition';

export class ElementAttributeMatches implements MatchCondition {
  public constructor(
    private readonly attributeName: string,
    private readonly attributeValue: string
  ) {}

  public match(element: XMLElement): boolean {
    return element.attributes.some(
      attr => attr.key === this.attributeName && attr.value === this.attributeValue
    );
  }
}
