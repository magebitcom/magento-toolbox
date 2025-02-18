import { Interface } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpNode } from './PhpNode';
import { PhpFile } from './PhpFile';
import { PhpMethod } from './PhpMethod';

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

  public get namespace() {
    return this.parent.namespace;
  }

  public get methods(): PhpMethod[] {
    return this.searchAst(NodeKind.Method).map(ast => new PhpMethod(ast, this));
  }

  public get extends(): string[] {
    return this.ast.extends?.map(ext => this.getIdentifierName(ext)) ?? [];
  }
}
