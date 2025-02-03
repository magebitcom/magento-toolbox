import { Class } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpNode } from './PhpNode';
import { PhpFile } from './PhpFile';
import { PhpMethod } from './PhpMethod';

export class PhpClass extends PhpNode<NodeKind.Class> {
  constructor(
    ast: Class,
    public parent: PhpFile
  ) {
    super(ast);
  }

  public get name() {
    return this.getIdentifierName(this.ast.name);
  }

  public get methods() {
    return this.searchAst(NodeKind.Method).map(ast => new PhpMethod(ast, this));
  }
}
