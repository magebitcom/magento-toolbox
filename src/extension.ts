// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import GenerateModuleCommand from 'command/GenerateModuleCommand';
import IndexWorkspaceCommand from 'command/IndexWorkspaceCommand';
import ExtensionState from 'common/ExtensionState';
import IndexRunner from 'indexer/IndexRunner';
import ActiveTextEditorChangeObserver from 'observer/ActiveTextEditorChangeObserver';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  console.log('[Magento Toolbox] Activating extension');
  const commands = [IndexWorkspaceCommand, GenerateModuleCommand];

  ExtensionState.init(context);

  commands.forEach(command => {
    const instance = new command();

    console.log('Registering command', instance.getCommand());

    const disposable = vscode.commands.registerCommand(instance.getCommand(), (...args) => {
      instance.execute(...args);
    });

    context.subscriptions.push(disposable);
  });

  await IndexRunner.getInstance().indexWorkspace();

  const activeTextEditorChangeObserver = new ActiveTextEditorChangeObserver();

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(event => {
      activeTextEditorChangeObserver.execute(event);
    })
  );

  await activeTextEditorChangeObserver.execute(vscode.window.activeTextEditor);

  console.log('[Magento Toolbox] Done');
}

// This method is called when your extension is deactivated
export function deactivate() {}
