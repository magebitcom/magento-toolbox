import { Interface } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpNode } from './PhpNode';
import { PhpFile } from './PhpFile';

export class PhpInterface extends PhpNode<NodeKind.Interface> {
  constructor(
    ast: Interface,
    public parent: PhpFile
  ) {
    super(ast);
  }

  public get name() {
    return this.getIdentifierName(this.ast.name);
  }
}
