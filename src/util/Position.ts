import { Position as PhpAstPosition } from 'php-parser';
import { Position as VsCodePosition } from 'vscode';

export default class Position {
  public static phpAstPositionToVsCodePosition(phpAstPosition: PhpAstPosition): VsCodePosition {
    return new VsCodePosition(Math.max(phpAstPosition.line - 1, 0), phpAstPosition.column);
  }
}
