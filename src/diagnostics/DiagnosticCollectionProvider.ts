import { Diagnostic, DiagnosticCollection, languages, TextDocument, Uri } from 'vscode';
import { LanguageDiagnostics } from './LanguageDiagnostics';
import PluginDiagnostics from './php/PluginDiagnostics';
import LayoutDiagnostics from './xml/LayoutDiagnostics';
import AclResourceDiagnostics from './xml/AclResourceDiagnostics';
import CacheableFalseInDefaultLayoutDiagnostics from './xml/CacheableFalseInDefaultLayoutDiagnostics';
import InvalidDiTypeDiagnostics from './xml/InvalidDiTypeDiagnostics';
import InvalidVirtualTypeSourceClassDiagnostics from './xml/InvalidVirtualTypeSourceClassDiagnostics';
import ModuleDeclarationDiagnostics from './xml/ModuleDeclarationDiagnostics';
import ModuleScopeDiagnostics from './xml/ModuleScopeDiagnostics';
import ObserverDeclarationDiagnostics from './xml/ObserverDeclarationDiagnostics';
import PluginAttrTypeDiagnostics from './xml/PluginAttrTypeDiagnostics';
import PluginDeclarationDiagnostics from './xml/PluginDeclarationDiagnostics';
import PreferenceDeclarationDiagnostics from './xml/PreferenceDeclarationDiagnostics';
import WebApiServiceDiagnostics from './xml/WebApiServiceDiagnostics';

class DiagnosticCollectionProvider {
  private readonly languageDiagnostics: LanguageDiagnostics[];
  private readonly collections: Record<string, DiagnosticCollection>;

  constructor() {
    this.languageDiagnostics = [
      new PluginDiagnostics(),
      new LayoutDiagnostics(),
      new AclResourceDiagnostics(),
      new CacheableFalseInDefaultLayoutDiagnostics(),
      new InvalidDiTypeDiagnostics(),
      new InvalidVirtualTypeSourceClassDiagnostics(),
      new ModuleDeclarationDiagnostics(),
      new ModuleScopeDiagnostics(),
      new ObserverDeclarationDiagnostics(),
      new PluginAttrTypeDiagnostics(),
      new PluginDeclarationDiagnostics(),
      new PreferenceDeclarationDiagnostics(),
      new WebApiServiceDiagnostics(),
    ];
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
      this.getCollection(language).delete(document.uri);
    }

    for (const language in diagnostics) {
      this.getCollection(language).set(document.uri, diagnostics[language]);
    }
  }

  public clear(uri: Uri): void {
    for (const language in this.collections) {
      this.collections[language].delete(uri);
    }
  }
}

export default new DiagnosticCollectionProvider();
