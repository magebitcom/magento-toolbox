import { LanguageDiagnostics } from 'diagnostics/LanguageDiagnostics';
import { Diagnostic, TextDocument } from 'vscode';

export default class PluginDiagnostics implements LanguageDiagnostics {
  public getLanguage(): string {
    return 'php';
  }

  public async updateDiagnostics(document: TextDocument): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];

    // TODO

    return diagnostics;
  }
}
