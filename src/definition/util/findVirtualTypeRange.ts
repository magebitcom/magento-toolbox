import { Range, Uri, workspace } from 'vscode';

const VIRTUAL_TYPE_TAG = /<virtualType\b[^>]*\bname="([^"]*)"/g;

export async function findVirtualTypeRange(
  diPath: string,
  name: string
): Promise<{ uri: Uri; range: Range } | undefined> {
  const uri = Uri.file(diPath);
  const document = await workspace.openTextDocument(uri);
  const text = document.getText();

  VIRTUAL_TYPE_TAG.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = VIRTUAL_TYPE_TAG.exec(text)) !== null) {
    if (match[1] !== name) continue;

    const fullMatch = match[0];
    const nameValueRelative = fullMatch.indexOf(`"${name}"`) + 1;
    const startOffset = match.index + nameValueRelative;
    const endOffset = startOffset + name.length;

    return {
      uri,
      range: new Range(document.positionAt(startOffset), document.positionAt(endOffset)),
    };
  }

  return undefined;
}
