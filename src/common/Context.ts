import { commands, TextEditor } from 'vscode';
import PhpDocumentParser from './php/PhpDocumentParser';

export interface EditorContext {
  canGeneratePlugin: boolean;
}

class Context {
  public editorContext: EditorContext = {
    canGeneratePlugin: false,
  };

  public async updateContext(type: 'editor' | 'selection', editor?: TextEditor) {
    if (!editor) {
      await this.setContext({
        canGeneratePlugin: false,
      });

      return;
    }

    if (type === 'editor') {
      await this.setContext({
        canGeneratePlugin: await this.canGeneratePlugin(editor),
      });
    }

    return this.setContext(this.editorContext);
  }

  public async setContext(editorContext: EditorContext) {
    const promises = Object.entries(editorContext).map(([key, value]) => {
      this.editorContext[key as keyof EditorContext] = value;
      return commands.executeCommand('setContext', `magento-toolbox.${key}`, value);
    });

    await Promise.all(promises);
  }

  private async canGeneratePlugin(editor: TextEditor): Promise<boolean> {
    if (editor.document.languageId !== 'php') {
      return false;
    }

    const phpFile = await PhpDocumentParser.parse(editor.document);
    const phpClass = phpFile.classes[0];

    if (phpClass) {
      const canGeneratePlugin =
        !phpClass.ast.isFinal &&
        (!phpClass.ast.implements ||
          !phpClass.ast.implements.find(item => item.name === 'NoninterceptableInterface'));

      return canGeneratePlugin;
    }

    const phpInterface = phpFile.interfaces[0];

    if (phpInterface) {
      if (
        phpInterface.ast.extends &&
        phpInterface.ast.extends.find(item => item.name === 'NoninterceptableInterface')
      ) {
        return false;
      }

      return true;
    }

    return false;
  }
}

export default new Context();
