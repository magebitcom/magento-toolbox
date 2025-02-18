import { Program } from 'php-parser';
import { first } from 'lodash-es';
import { Uri } from 'vscode';
import { PhpNode } from './PhpNode';
import { NodeKind } from './Parser';
import { PhpClass } from './PhpClass';
import { PhpInterface } from './PhpInterface';
import { PhpUseItem } from './PhpUseItem';

export class PhpFile extends PhpNode<NodeKind.Program> {
  constructor(
    ast: Program,
    public readonly uri: Uri
  ) {
    super(ast);
  }

  public get namespace() {
    const namespace = first(this.searchAst(NodeKind.Namespace));

    if (!namespace) {
      throw new Error('No namespace found');
    }

    return namespace.name;
  }

  public get classes() {
    return this.searchAst(NodeKind.Class).map(ast => new PhpClass(ast, this));
  }

  public get interfaces() {
    return this.searchAst(NodeKind.Interface).map(ast => new PhpInterface(ast, this));
  }

  public get useItems() {
    return this.searchAst(NodeKind.UseItem).map(ast => new PhpUseItem(ast, this));
  }

  public get comments(): string[] {
    return this.ast.comments?.map(comment => comment.value) ?? [];
  }
}
