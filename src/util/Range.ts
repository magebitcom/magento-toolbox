import { Range as VsCodeRange } from 'vscode';

export default class Range {
  public static fileRegexToVsCodeRange(fileRegex: RegExp, content: string): VsCodeRange {
    const matches = this.fileRegexToVsCodeRanges(fileRegex, content);
    return matches[0] ?? new VsCodeRange(0, 0, 0, 0);
  }

  public static fileRegexToVsCodeRanges(fileRegex: RegExp, content: string): VsCodeRange[] {
    const flags = fileRegex.flags.includes('g') ? fileRegex.flags : fileRegex.flags + 'g';
    const regex = new RegExp(fileRegex.source, flags);
    const ranges: VsCodeRange[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const matchedText = match[1] !== undefined ? match[1] : match[0];
      const matchPosition =
        match[1] !== undefined ? content.indexOf(match[1], match.index) : match.index;

      const beforeMatch = content.substring(0, matchPosition);
      const lines = beforeMatch.split('\n');
      const lineNumber = lines.length - 1;
      const characterOffset = lines[lines.length - 1].length;

      const matchWithNewlines = matchedText.split('\n');
      const endLine = lineNumber + matchWithNewlines.length - 1;
      const endCharacter =
        matchWithNewlines.length > 1
          ? matchWithNewlines[matchWithNewlines.length - 1].length
          : characterOffset + matchedText.length;

      ranges.push(new VsCodeRange(lineNumber, characterOffset, endLine, endCharacter));

      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }

    return ranges;
  }
}
