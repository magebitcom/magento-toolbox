import { UseItem } from 'php-parser';
import { NodeKind } from './Parser';
import { PhpFile } from './PhpFile';
import { PhpNode } from './PhpNode';
import last from 'lodash-es/last';

export class PhpUseItem extends PhpNode<NodeKind.UseItem> {
  constructor(
    ast: UseItem,
    public parent: PhpFile
  ) {
    super(ast);
  }

  public get fullName() {
    if (this.ast.alias) {
      return this.ast.alias.name;
    }
    return this.ast.name;
  }

  public get name() {
    if (this.ast.alias) {
      return this.ast.alias.name;
    }

    const parts = this.ast.name.split('\\');
    return last(parts)!;
  }
}
