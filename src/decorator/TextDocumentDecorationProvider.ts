import { DecorationOptions, TextDocument, TextEditorDecorationType } from 'vscode';

export default abstract class TextDocumentDecorationProvider {
  public constructor(protected readonly document: TextDocument) {}

  public abstract getType(): TextEditorDecorationType;

  public abstract getDecorations(): Promise<DecorationOptions[]>;
}
