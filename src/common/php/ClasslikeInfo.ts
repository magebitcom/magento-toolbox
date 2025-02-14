import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';
import Position from 'util/Position';
import { Range } from 'vscode';

export class ClasslikeInfo {
  public constructor(private readonly phpFile: PhpFile) {}

  public getNameRange(): Range | undefined {
    const classlikeNode = this.phpFile.classes[0] || this.phpFile.interfaces[0];

    if (!classlikeNode) {
      return;
    }

    const classlikeName = classlikeNode.ast.name;

    if (typeof classlikeName === 'string' || !classlikeName.loc) {
      return;
    }

    const range = new Range(
      Position.phpAstPositionToVsCodePosition(classlikeName.loc.start),
      Position.phpAstPositionToVsCodePosition(classlikeName.loc.end)
    );

    return range;
  }

  public getMethodByName(
    phpClasslike: PhpClass | PhpInterface,
    name: string
  ): PhpMethod | undefined {
    return phpClasslike.methods?.find(method => method.name === name);
  }
}
