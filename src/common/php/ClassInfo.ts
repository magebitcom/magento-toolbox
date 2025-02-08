import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpMethod } from 'parser/php/PhpMethod';
import Position from 'util/Position';
import { Range } from 'vscode';

export class ClassInfo {
  public constructor(private readonly phpFile: PhpFile) {}

  public getNameRange(): Range | undefined {
    const classNode = this.phpFile.classes[0];

    if (!classNode) {
      return;
    }

    const className = classNode.ast.name;

    if (typeof className === 'string' || !className.loc) {
      return;
    }

    const range = new Range(
      Position.phpAstPositionToVsCodePosition(className.loc.start),
      Position.phpAstPositionToVsCodePosition(className.loc.end)
    );

    return range;
  }

  public getMethodByName(phpClass: PhpClass, name: string): PhpMethod | undefined {
    return phpClass.methods.find(method => method.name === name);
  }
}
