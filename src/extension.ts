import ExtensionState from 'common/ExtensionState';
import IndexRunner from 'indexer/IndexRunner';
import ActiveTextEditorChangeObserver from 'observer/ActiveTextEditorChangeObserver';
import * as vscode from 'vscode';
import DiagnosticCollectionProvider from 'diagnostics/DiagnosticCollectionProvider';
import ChangeTextEditorSelectionObserver from 'observer/ChangeTextEditorSelectionObserver';
import DocumentCache from 'cache/DocumentCache';
import { XmlClasslikeDefinitionProvider } from 'definition/XmlClasslikeDefinitionProvider';
import XmlClasslikeHoverProvider from 'hover/XmlClasslikeHoverProvider';
import ObserverCodelensProvider from 'codelens/ObserverCodelensProvider';
import * as commands from 'command';
import Magento from 'util/Magento';
import { WorkspaceFolder } from 'vscode';
import Logger from 'util/Logger';
import { Command } from 'command/Command';
import { XmlSnippetProvider } from 'completion/XmlSnippetProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('[Magento Toolbox] Activating extension');

  const magentoWorkspaces: WorkspaceFolder[] = [];

  if (vscode.workspace.workspaceFolders) {
    for (const folder of vscode.workspace.workspaceFolders) {
      if (await Magento.isMagentoWorkspace(folder)) {
        magentoWorkspaces.push(folder);
      }
    }
  }

  ExtensionState.init(context, magentoWorkspaces);

  Object.values(commands).forEach(command => {
    const instance = new command() as Command;

    Logger.log('Registering command', instance.getCommand());

    const disposable = vscode.commands.registerCommand(instance.getCommand(), async (...args) => {
      try {
        await instance.execute(...args);
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(
          'An error occurred while executing the command: ' + instance.getCommand()
        );
      }
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

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'xml',
      new XmlSnippetProvider(),
      ...XmlSnippetProvider.TRIGGER_CHARACTERS
    )
  );

  await activeTextEditorChangeObserver.execute(vscode.window.activeTextEditor);

  if (vscode.window.activeTextEditor) {
    DiagnosticCollectionProvider.updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  return context;
}

// This method is called when your extension is deactivated
export function deactivate() {}
