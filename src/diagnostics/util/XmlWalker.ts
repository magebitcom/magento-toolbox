import { XMLAttribute, XMLElement } from '@xml-tools/ast';

export default class XmlWalker {
  public static walk(root: XMLElement, visit: (element: XMLElement) => void): void {
    const stack: XMLElement[] = [root];
    while (stack.length) {
      const element = stack.pop() as XMLElement;
      visit(element);
      for (const child of element.subElements) {
        stack.push(child);
      }
    }
  }

  public static attr(element: XMLElement, name: string): XMLAttribute | undefined {
    return element.attributes.find(a => a.key === name);
  }

  public static attrValue(element: XMLElement, name: string): string | undefined {
    return XmlWalker.attr(element, name)?.value ?? undefined;
  }

  public static collect(root: XMLElement, predicate: (el: XMLElement) => boolean): XMLElement[] {
    const matches: XMLElement[] = [];
    XmlWalker.walk(root, el => {
      if (predicate(el)) {
        matches.push(el);
      }
    });
    return matches;
  }
}
