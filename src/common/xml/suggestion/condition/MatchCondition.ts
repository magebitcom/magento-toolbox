import { XMLAttribute, XMLElement } from '@xml-tools/ast';

export interface MatchCondition {
  match(element: XMLElement, attribute?: XMLAttribute): boolean;
}
