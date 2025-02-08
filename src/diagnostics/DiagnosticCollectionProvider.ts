import { Diagnostic, DiagnosticCollection, languages, TextDocument } from 'vscode';
import { LanguageDiagnostics } from './LanguageDiagnostics';
import PluginDiagnostics from './php/PluginDiagnostics';

class DiagnosticCollectionProvider {
  private readonly languageDiagnostics: LanguageDiagnostics[];
  private readonly collections: Record<string, DiagnosticCollection>;

  constructor() {
    this.languageDiagnostics = [new PluginDiagnostics()];
    this.collections = {};
  }

  public getCollection(language: string): DiagnosticCollection {
    if (!this.collections[language]) {
      this.collections[language] = languages.createDiagnosticCollection(language);
    }

    return this.collections[language];
  }

  public async updateDiagnostics(document: TextDocument): Promise<void> {
    const diagnostics: Record<string, Diagnostic[]> = {};

    for (const languageDiagnostic of this.languageDiagnostics) {
      const language = languageDiagnostic.getLanguage();

      if (language !== document.languageId) {
        continue;
      }

      const languageDiagnostics = await languageDiagnostic.updateDiagnostics(document);

      if (!diagnostics[language]) {
        diagnostics[language] = [];
      }

      diagnostics[language].push(...languageDiagnostics);
    }

    for (const language in this.collections) {
      this.getCollection(language).clear();
    }

    for (const language in diagnostics) {
      this.getCollection(language).set(document.uri, diagnostics[language]);
    }
  }
}

export default new DiagnosticCollectionProvider();
