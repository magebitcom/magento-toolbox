import { Position as PhpAstPosition, Location as PhpAstLocation } from 'php-parser';
import { Position as VsCodePosition, Range } from 'vscode';

export default class Position {
  public static phpAstPositionToVsCodePosition(phpAstPosition: PhpAstPosition): VsCodePosition {
    return new VsCodePosition(Math.max(phpAstPosition.line - 1, 0), phpAstPosition.column);
  }

  public static phpAstLocationToVsCodeRange(phpAstLocation: PhpAstLocation): Range {
    return new Range(
      this.phpAstPositionToVsCodePosition(phpAstLocation.start),
      this.phpAstPositionToVsCodePosition(phpAstLocation.end)
    );
  }
}
