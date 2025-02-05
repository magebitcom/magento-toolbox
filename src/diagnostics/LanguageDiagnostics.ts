import { Diagnostic, TextDocument } from 'vscode';

export interface LanguageDiagnostics {
  getLanguage(): string;
  updateDiagnostics(document: TextDocument): Promise<Diagnostic[]>;
}
