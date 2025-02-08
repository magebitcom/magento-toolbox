import { TextEditorSelectionChangeEvent } from 'vscode';
import Observer from './Observer';
import Context from 'common/Context';

export default class ChangeTextEditorSelectionObserver extends Observer {
  public async execute(e: TextEditorSelectionChangeEvent): Promise<void> {
    await Context.updateContext('selection', e.textEditor);
  }
}
