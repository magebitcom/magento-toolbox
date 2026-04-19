export interface TagMatch {
  startIndex: number;
  endIndex: number;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Match opening tag like `<foo id="bar" ...>` in a slice of xml. */
export function findOpeningTagWithId(
  xml: string,
  tagName: string,
  id: string,
  fromIndex = 0,
  toIndex?: number
): TagMatch | null {
  const region = toIndex === undefined ? xml.slice(fromIndex) : xml.slice(fromIndex, toIndex);
  const regex = new RegExp(`<${tagName}\\s+id=["']${escapeRegex(id)}["'][^>]*>`, 'i');
  const match = region.match(regex);
  if (!match || match.index === undefined) {
    return null;
  }
  const startIndex = fromIndex + match.index;
  return { startIndex, endIndex: startIndex + match[0].length };
}

/** Match a plain opening tag (e.g. `<my_section>` or `<my_section foo="bar">`). */
export function findSimpleOpeningTag(
  xml: string,
  tagName: string,
  fromIndex = 0,
  toIndex?: number
): TagMatch | null {
  const region = toIndex === undefined ? xml.slice(fromIndex) : xml.slice(fromIndex, toIndex);
  const regex = new RegExp(`<${escapeRegex(tagName)}(?:\\s[^>]*)?>`, 'i');
  const match = region.match(regex);
  if (!match || match.index === undefined) {
    return null;
  }
  const startIndex = fromIndex + match.index;
  return { startIndex, endIndex: startIndex + match[0].length };
}

/**
 * Walk backwards from `idx` past space/tab characters. Returns the position
 * immediately after the preceding newline (or the start of the string).
 * Used to find the start of an indented line so we can insert a sibling
 * at the same indent level without mangling the closing tag.
 */
export function walkBackToLineStart(xml: string, idx: number): number {
  if (idx <= 0) {
    return 0;
  }
  let i = idx;
  while (i > 0 && (xml[i - 1] === ' ' || xml[i - 1] === '\t')) {
    i--;
  }
  return i;
}

export interface InsertOptions {
  /** Spaces to prepend to each line of `content` before insertion. */
  indent?: number;
  /** String written immediately before the indented content. Default `\n`. */
  before?: string;
  /** String written immediately after the indented content. Default `\n`. */
  after?: string;
}

/**
 * Splice indented content into `xml` at the given position, wrapped by the
 * configured `before`/`after` separators.
 */
export function insertAt(
  xml: string,
  insertPos: number,
  content: string,
  options: InsertOptions = {}
): string {
  const indent = options.indent ?? 0;
  const before = options.before ?? '\n';
  const after = options.after ?? '\n';
  const indented =
    indent > 0
      ? content
          .split('\n')
          .map(l => ' '.repeat(indent) + l)
          .join('\n')
      : content;
  return xml.slice(0, insertPos) + before + indented + after + xml.slice(insertPos);
}
