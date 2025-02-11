import { DecorationOptions, MarkdownString, TextEditorDecorationType, window, Range } from 'vscode';
import path from 'path';
import { DiPlugin } from 'indexer/data/DiIndexData';
import IndexStorage from 'common/IndexStorage';
import MarkdownMessageBuilder from 'common/MarkdownMessageBuilder';
import PhpNamespace from 'common/PhpNamespace';
import AutoloadNamespaceIndexer from 'indexer/AutoloadNamespaceIndexer';
import TextDocumentDecorationProvider from './TextDocumentDecorationProvider';
import PhpParser from 'parser/php/Parser';
import Position from 'util/Position';
import PluginSubjectInfo from 'common/php/PluginSubjectInfo';
import PluginInfo from 'common/php/PluginInfo';
import Magento from 'util/Magento';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';

export default class PluginClassDecorationProvider extends TextDocumentDecorationProvider {
  public getType(): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
      gutterIconPath: path.join(__dirname, 'resources', 'icons', 'plugin.svg'),
      gutterIconSize: '80%',
      borderColor: 'rgba(0, 188, 202, 0.5)',
      borderStyle: 'dotted',
      borderWidth: '0 0 1px 0',
    });
  }

  public async getDecorations(): Promise<DecorationOptions[]> {
    const decorations: DecorationOptions[] = [];
    const parser = new PhpParser();
    const phpFile = await parser.parseDocument(this.document);

    const classLikeNode: PhpClass | PhpInterface | undefined =
      phpFile.classes[0] || phpFile.interfaces[0];

    if (!classLikeNode) {
      return decorations;
    }

    const pluginSubjectInfo = new PluginSubjectInfo(phpFile);
    const classlikeInfo = new ClasslikeInfo(phpFile);
    const classPlugins = pluginSubjectInfo.getPlugins(classLikeNode);

    if (classPlugins.length === 0) {
      return decorations;
    }

    const nameRange = classlikeInfo.getNameRange();

    if (!nameRange) {
      return decorations;
    }

    const hoverMessage = await this.getInterceptorHoverMessage(classPlugins);

    decorations.push({
      range: nameRange,
      hoverMessage,
    });

    const promises = classPlugins.map(async plugin => {
      const fileUri = await IndexStorage.get(AutoloadNamespaceIndexer.KEY)!.findClassByNamespace(
        PhpNamespace.fromString(plugin.type)
      );

      if (!fileUri) {
        return;
      }

      const pluginPhpFile = await parser.parse(fileUri);
      const pluginInfo = new PluginInfo(pluginPhpFile);
      const pluginMethods = pluginInfo.getPluginMethods(pluginPhpFile.classes[0]);

      return pluginMethods.map(method => {
        const subjectMethodName = Magento.pluginMethodToMethodName(method.name);

        if (!subjectMethodName) {
          return;
        }

        const subjectMethod = classlikeInfo.getMethodByName(phpFile.classes[0], subjectMethodName);

        if (!subjectMethod) {
          return;
        }

        if (typeof subjectMethod.ast.name === 'string' || !subjectMethod.ast.name.loc) {
          return;
        }

        const range = new Range(
          Position.phpAstPositionToVsCodePosition(subjectMethod.ast.name.loc.start),
          Position.phpAstPositionToVsCodePosition(subjectMethod.ast.name.loc.end)
        );

        const message = MarkdownMessageBuilder.create('Interceptors');
        const link = `[${plugin.type}](${fileUri})`;
        message.appendMarkdown(`- ${link} [(di.xml)](${plugin.diUri})\n`);

        return {
          range,
          hoverMessage: message.build(),
        };
      });
    });

    const pluginMethodsDecorations = await Promise.all(promises);

    decorations.push(...(pluginMethodsDecorations.flat().filter(Boolean) as DecorationOptions[]));

    return decorations;
  }

  private async getInterceptorHoverMessage(classInterceptors: DiPlugin[]): Promise<MarkdownString> {
    const message = MarkdownMessageBuilder.create('Interceptors');

    for (const interceptor of classInterceptors) {
      const fileUri = await IndexStorage.get(AutoloadNamespaceIndexer.KEY)!.findClassByNamespace(
        PhpNamespace.fromString(interceptor.type)
      );

      message.appendMarkdown(`- [${interceptor.type}](${fileUri ?? '#'})\n`);
    }

    return message.build();
  }
}
