import { Method } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpClass } from './PhpClass';
import { PhpNode } from './PhpNode';

export class PhpMethod extends PhpNode<NodeKind.Method> {
  constructor(
    ast: Method,
    public parent: PhpClass
  ) {
    super(ast);
  }

  public get name() {
    return this.getIdentifierName(this.ast.name);
  }
}
