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

export default class RemoveCacheableAttributeAction {
  public static async build(
    document: TextDocument,
    diagnostic: Diagnostic
  ): Promise<CodeAction | undefined> {
    const tokens = await XmlDocumentParser.parse(document);
    const root = tokens.ast.rootElement;
    if (!root) return undefined;

    const diagStart = diagnostic.range.start;
    const blocks = XmlWalker.collect(root, el => {
      if (el.name !== 'block') return false;
      const pos = el.position;
      if (!pos) return false;
      return diagStart.line >= pos.startLine - 1 && diagStart.line <= pos.endLine - 1;
    });
    if (!blocks.length) return undefined;

    const block = blocks[0];
    const cacheableAttr = XmlWalker.attr(block, 'cacheable');
    if (!cacheableAttr?.position) return undefined;

    const start = new Position(
      cacheableAttr.position.startLine - 1,
      Math.max(cacheableAttr.position.startColumn - 2, 0)
    );
    const end = new Position(
      cacheableAttr.position.endLine - 1,
      cacheableAttr.position.endColumn - 1
    );

    const action = new CodeAction('Remove cacheable="false" attribute', CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.edit = new WorkspaceEdit();
    action.edit.delete(document.uri, new Range(start, end));
    action.isPreferred = true;

    return action;
  }
}
