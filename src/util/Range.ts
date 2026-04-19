import { Range as VsCodeRange } from 'vscode';

export default class Range {
  public static fileRegexToVsCodeRange(fileRegex: RegExp, content: string): VsCodeRange {
    const match = content.match(fileRegex);

    if (match && match.index !== undefined) {
      // Get the matched text (use capture group if exists, otherwise full match)
      const matchedText = match[1] !== undefined ? match[1] : match[0];

      // Calculate the actual position of the matched text
      const matchPosition =
        match[1] !== undefined ? content.indexOf(match[1], match.index) : match.index;

      // Split content up to the match to calculate line number and character offset
      const beforeMatch = content.substring(0, matchPosition);
      const lines = beforeMatch.split('\n');
      const lineNumber = lines.length - 1;
      const characterOffset = lines[lines.length - 1].length;

      // Calculate end position
      const matchWithNewlines = matchedText.split('\n');
      const endLine = lineNumber + matchWithNewlines.length - 1;
      const endCharacter =
        matchWithNewlines.length > 1
          ? matchWithNewlines[matchWithNewlines.length - 1].length
          : characterOffset + matchedText.length;

      return new VsCodeRange(lineNumber, characterOffset, endLine, endCharacter);
    }

    return new VsCodeRange(0, 0, 0, 0);
  }
}
