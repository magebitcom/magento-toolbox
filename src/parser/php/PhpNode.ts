import { KindType, NodeKind } from './Parser';
import { Identifier } from 'php-parser';

export abstract class PhpNode<K = NodeKind> {
  constructor(public ast: KindType<K>) {}

  public searchAst<K extends NodeKind>(kind: K) {
    const results: KindType<K>[] = [];

    const search = (node: any) => {
      if (!node) return;

      if (Array.isArray(node)) {
        for (const item of node) {
          search(item);
        }
      } else {
        if (node.kind === kind) {
          results.push(node);
        }

        for (const key in node) {
          if (node[key] !== node) {
            search(node[key]);
          }
        }
      }
    };

    search(this.ast);
    return results;
  }

  public getIdentifierName(node: Identifier | string) {
    if (typeof node === 'string') {
      return node;
    }

    return node.name;
  }
}
