import { TextEditor } from 'vscode';
import Observer from './Observer';
import PluginClassDecorationProvider from 'decorator/PluginClassDecorationProvider';
import Context from 'common/Context';
import ObserverInstanceDecorationProvider from 'decorator/ObserverInstanceDecorationProvider';
import CronClassDecorationProvider from 'decorator/CronClassDecorationProvider';

export default class ActiveTextEditorChangeObserver extends Observer {
  public async execute(textEditor: TextEditor | undefined): Promise<void> {
    await Context.updateContext('editor', textEditor);

    if (textEditor && textEditor.document.languageId === 'php') {
      const pluginProvider = new PluginClassDecorationProvider(textEditor.document);
      const observerProvider = new ObserverInstanceDecorationProvider(textEditor.document);
      const cronProvider = new CronClassDecorationProvider(textEditor.document);

      const [pluginDecorations, observerDecorations, cronDecorations] = await Promise.all([
        pluginProvider.getDecorations(),
        observerProvider.getDecorations(),
        cronProvider.getDecorations(),
      ]);

      textEditor.setDecorations(pluginProvider.getType(), pluginDecorations);
      textEditor.setDecorations(observerProvider.getType(), observerDecorations);
      textEditor.setDecorations(cronProvider.getType(), cronDecorations);
    }
  }
}
