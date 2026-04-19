import {
  CodeAction,
  CodeActionKind,
  Diagnostic,
  Position,
  Range,
  TextDocument,
  WorkspaceEdit,
} from 'vscode';
import XmlDocumentParser from 'common/xml/XmlDocumentParser';
import XmlWalker from 'diagnostics/util/XmlWalker';

export default class FixModuleNameAction {
  public static async build(
    document: TextDocument,
    diagnostic: Diagnostic
  ): Promise<CodeAction | undefined> {
    const expected = (diagnostic as any).data?.expectedName as string | undefined;
    if (!expected) {
      return undefined;
    }

    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return undefined;

    const moduleEl = XmlWalker.collect(root, el => el.name === 'module')[0];
    if (!moduleEl) return undefined;

    const nameAttr = XmlWalker.attr(moduleEl, 'name');
    if (!nameAttr?.position) return undefined;

    const valueStart = new Position(
      nameAttr.position.startLine - 1,
      nameAttr.position.startColumn + 1 + (nameAttr.key?.length ?? 0)
    );
    const valueEnd = new Position(nameAttr.position.endLine - 1, nameAttr.position.endColumn - 1);

    const action = new CodeAction(`Rename module to "${expected}"`, CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.edit = new WorkspaceEdit();
    action.edit.replace(document.uri, new Range(valueStart, valueEnd), expected);
    action.isPreferred = true;

    return action;
  }
}
