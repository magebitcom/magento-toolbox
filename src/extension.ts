// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import GenerateModuleCommand from 'command/GenerateModuleCommand';
import IndexWorkspaceCommand from 'command/IndexWorkspaceCommand';
import ExtensionState from 'common/ExtensionState';
import IndexRunner from 'indexer/IndexRunner';
import ActiveTextEditorChangeObserver from 'observer/ActiveTextEditorChangeObserver';
import * as vscode from 'vscode';
import DiagnosticCollectionProvider from 'diagnostics/DiagnosticCollectionProvider';
import ChangeTextEditorSelectionObserver from 'observer/ChangeTextEditorSelectionObserver';
import DocumentCache from 'cache/DocumentCache';
import GenerateContextPluginCommand from 'command/GenerateContextPluginCommand';
import { XmlClasslikeDefinitionProvider } from 'definition/XmlClasslikeDefinitionProvider';
import CopyMagentoPathCommand from 'command/CopyMagentoPathCommand';
import Common from 'util/Common';
import GenerateXmlCatalogCommand from 'command/GenerateXmlCatalogCommand';
import XmlClasslikeHoverProvider from 'hover/XmlClasslikeHoverProvider';
import ObserverCodelensProvider from 'codelens/ObserverCodelensProvider';
import GenerateObserverCommand from 'command/GenerateObserverCommand';
import GenerateBlockCommand from 'command/GenerateBlockCommand';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('[Magento Toolbox] Activating extension');

  const commands = [
    IndexWorkspaceCommand,
    GenerateModuleCommand,
    GenerateContextPluginCommand,
    CopyMagentoPathCommand,
    GenerateXmlCatalogCommand,
    GenerateObserverCommand,
    GenerateBlockCommand,
  ];

  ExtensionState.init(context);

  commands.forEach(command => {
    const instance = new command();

    Common.log('Registering command', instance.getCommand());

    const disposable = vscode.commands.registerCommand(instance.getCommand(), (...args) => {
      instance.execute(...args);
    });

    context.subscriptions.push(disposable);
  });

  await IndexRunner.indexWorkspace();

  const activeTextEditorChangeObserver = new ActiveTextEditorChangeObserver();
  const changeTextEditorSelectionObserver = new ChangeTextEditorSelectionObserver();

  // window observers
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(event => {
      activeTextEditorChangeObserver.execute(event);

      if (event?.document) {
        DiagnosticCollectionProvider.updateDiagnostics(event.document);
      }
    }),
    vscode.window.onDidChangeTextEditorSelection(event => {
      changeTextEditorSelectionObserver.execute(event);
    })
  );

  // workspace observers
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      DiagnosticCollectionProvider.updateDiagnostics(event.document);
    }),
    vscode.workspace.onDidCloseTextDocument(event => {
      DocumentCache.clear(event);
    }),
    vscode.workspace.onDidSaveTextDocument(textDocument => {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(textDocument.uri);

      if (workspaceFolder) {
        IndexRunner.indexFile(workspaceFolder, textDocument.uri);
      }

      DocumentCache.clear(textDocument);
    })
  );

  // definition providers
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider('xml', new XmlClasslikeDefinitionProvider())
  );

  // codelens providers
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider('php', new ObserverCodelensProvider())
  );

  // hover providers
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('xml', new XmlClasslikeHoverProvider())
  );

  await activeTextEditorChangeObserver.execute(vscode.window.activeTextEditor);

  if (vscode.window.activeTextEditor) {
    DiagnosticCollectionProvider.updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  console.log('[Magento Toolbox] Loaded');
}

// This method is called when your extension is deactivated
export function deactivate() {}
