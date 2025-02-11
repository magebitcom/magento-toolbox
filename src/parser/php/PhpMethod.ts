import { Method } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpClass } from './PhpClass';
import { PhpNode } from './PhpNode';
import { PhpInterface } from './PhpInterface';

export class PhpMethod extends PhpNode<NodeKind.Method> {
  constructor(
    ast: Method,
    public parent: PhpClass | PhpInterface
  ) {
    super(ast);
  }

  public get name() {
    return this.getIdentifierName(this.ast.name);
  }
}
