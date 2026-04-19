import {
  CodeAction,
  CodeActionKind,
  Diagnostic,
  Position,
  Range,
  TextDocument,
  Uri,
  WorkspaceEdit,
  workspace,
} from 'vscode';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import PositionUtil from 'util/Position';

export default class MakeMethodPublicAction {
  public static async build(
    _document: TextDocument,
    diagnostic: Diagnostic
  ): Promise<CodeAction | undefined> {
    const data = (diagnostic as any).data as
      | { classFile?: string; methodName?: string }
      | undefined;
    if (!data?.classFile || !data.methodName) return undefined;

    const uri = Uri.file(data.classFile);
    let phpDoc: TextDocument;
    try {
      phpDoc = await workspace.openTextDocument(uri);
    } catch {
      return undefined;
    }

    const phpFile = await PhpDocumentParser.parse(phpDoc);

    const classlike = phpFile.classes[0] ?? phpFile.interfaces[0];
    if (!classlike) return undefined;

    const method = classlike.methods?.find(m => m.name === data.methodName);
    if (!method?.ast?.loc) return undefined;

    const visibility = (method.ast as any).visibility as string | undefined;
    const methodStart = method.ast.loc.start;

    const action = new CodeAction(
      `Change visibility of method "${data.methodName}" to public`,
      CodeActionKind.QuickFix
    );
    action.diagnostics = [diagnostic];
    action.edit = new WorkspaceEdit();

    if (visibility && ['private', 'protected'].includes(visibility)) {
      const text = phpDoc.getText();
      const offset = phpDoc.offsetAt(PositionUtil.phpAstPositionToVsCodePosition(methodStart));
      const windowStart = Math.max(offset - 32, 0);
      const window = text.slice(windowStart, offset + 8);
      const rel = window.lastIndexOf(visibility);
      if (rel < 0) return undefined;

      const absStart = windowStart + rel;
      const absEnd = absStart + visibility.length;

      action.edit.replace(
        uri,
        new Range(phpDoc.positionAt(absStart), phpDoc.positionAt(absEnd)),
        'public'
      );
    } else {
      const insertAt = PositionUtil.phpAstPositionToVsCodePosition(methodStart);
      action.edit.insert(uri, new Position(insertAt.line, insertAt.character), 'public ');
    }

    action.isPreferred = true;
    return action;
  }
}
