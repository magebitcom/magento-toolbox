import { TextEditor } from 'vscode';
import Observer from './Observer';
import PluginClassDecorationProvider from 'decorator/PluginClassDecorationProvider';

export default class ActiveTextEditorChangeObserver extends Observer {
  public async execute(textEditor: TextEditor | undefined): Promise<void> {
    if (textEditor && textEditor.document.uri.fsPath.endsWith('.php')) {
      const provider = new PluginClassDecorationProvider(textEditor.document);

      const decorations = await provider.getDecorations();
      textEditor.setDecorations(provider.getType(), decorations);
    }
  }
}
