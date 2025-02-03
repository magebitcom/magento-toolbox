import { DecorationOptions, MarkdownString, TextEditorDecorationType, window, Range } from 'vscode';
import path from 'path';
import { DiPlugin } from 'indexer/data/DiIndexData';
import IndexStorage from 'common/IndexStorage';
import MarkdownMessageBuilder from 'common/MarkdownMessageBuilder';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/AutoloadNamespaceIndexer';
import PhpClassInspecion from 'inspection/php/PhpClassInspecion';
import TextDocumentDecorationProvider from './TextDocumentDecorationProvider';
import flatten from 'lodash-es/flatten';

export default class PluginClassDecorationProvider extends TextDocumentDecorationProvider {
  public getType(): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      gutterIconPath: path.join(__dirname, 'resources', 'icons', 'plugin.svg'),
      gutterIconSize: '80%',
    });
  }

  public async getDecorations(): Promise<DecorationOptions[]> {
    const decorations: DecorationOptions[] = [];
    const classInspection = new PhpClassInspecion(this.document);
    const classInterceptors = classInspection.getClassInterceptors();

    if (classInterceptors.length === 0) {
      return decorations;
    }

    if (!classInspection.fileInfo.nameRange) {
      return decorations;
    }

    const hoverMessage = await this.getInterceptorHoverMessage(classInterceptors);

    decorations.push({
      range: classInspection.fileInfo.nameRange,
      hoverMessage,
    });

    const pluginMethodsDecorations = await this.getPluginMethodsDecorations(
      classInspection,
      classInterceptors
    );

    decorations.push(...pluginMethodsDecorations);

    return decorations;
  }

  private async getPluginMethodsDecorations(
    classInspection: PhpClassInspecion,
    classInterceptors: DiPlugin[]
  ): Promise<DecorationOptions[]> {
    const promises = classInterceptors.map(async interceptor => {
      const fileUri = await IndexStorage.get(AutoloadNamespaceIndexer.KEY)!.findClassByNamespace(
        PhpNamespace.fromString(interceptor.type)
      );

      if (!fileUri) {
        return;
      }

      const pluginMethods = await classInspection.getPluginMethods(fileUri);

      return pluginMethods.map(method => {
        const regex = new RegExp(`function\\s+${method}\\s*\\(`);
        const match = this.document.getText().match(regex);

        if (!match) {
          return;
        }

        const offset = 9;

        const range = new Range(
          this.document.positionAt(match.index! + offset),
          this.document.positionAt(match.index! + offset + method.length)
        );
        const link = `[${interceptor.type}](${fileUri})`;
        const message = MarkdownMessageBuilder.create('Interceptors');

        message.appendMarkdown(`- ${link} [(di.xml)](${interceptor.diUri})\n`);

        return {
          range,
          hoverMessage: message.build(),
        };
      });
    });

    return flatten(await Promise.all(promises)).filter(Boolean) as DecorationOptions[];
  }

  private async getInterceptorHoverMessage(classInterceptors: DiPlugin[]): Promise<MarkdownString> {
    const message = MarkdownMessageBuilder.create('Class plugins');

    for (const interceptor of classInterceptors) {
      const fileUri = await IndexStorage.get(AutoloadNamespaceIndexer.KEY)!.findClassByNamespace(
        PhpNamespace.fromString(interceptor.type)
      );

      message.appendMarkdown(`- [${interceptor.type}](${fileUri ?? '#'})\n`);
    }

    return message.build();
  }
}
