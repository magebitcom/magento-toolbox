import {
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeActionKind,
  CodeActionProvider,
  Range,
  Selection,
  TextDocument,
} from 'vscode';
import { DiagnosticCode } from './DiagnosticCodes';
import FixModuleNameAction from './fixes/FixModuleNameAction';
import MakeMethodPublicAction from './fixes/MakeMethodPublicAction';
import RemoveCacheableAttributeAction from './fixes/RemoveCacheableAttributeAction';

export default class QuickFixProvider implements CodeActionProvider {
  public async provideCodeActions(
    document: TextDocument,
    _range: Range | Selection,
    context: CodeActionContext,
    _token: CancellationToken
  ): Promise<CodeAction[]> {
    const actions: CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const code = typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code;

      if (code === DiagnosticCode.ModuleNameMismatch) {
        const action = await FixModuleNameAction.build(document, diagnostic);
        if (action) actions.push(action);
      }

      if (code === DiagnosticCode.CacheableFalseInDefaultLayout) {
        const action = await RemoveCacheableAttributeAction.build(document, diagnostic);
        if (action) actions.push(action);
      }

      if (code === DiagnosticCode.WebApiMethodNotPublic) {
        const action = await MakeMethodPublicAction.build(document, diagnostic);
        if (action) actions.push(action);
      }
    }

    return actions;
  }

  public static readonly metadata = {
    providedCodeActionKinds: [CodeActionKind.QuickFix],
  };
}
