import { TextEditor } from 'vscode';
import Observer from './Observer';
import PluginClassDecorationProvider from 'decorator/PluginClassDecorationProvider';
import Context from 'common/Context';

export default class ActiveTextEditorChangeObserver extends Observer {
  public async execute(textEditor: TextEditor | undefined): Promise<void> {
    await Context.updateContext('editor', textEditor);

    if (textEditor && textEditor.document.languageId === 'php') {
      const provider = new PluginClassDecorationProvider(textEditor.document);

      const decorations = await provider.getDecorations();
      textEditor.setDecorations(provider.getType(), decorations);
    }
  }
}
