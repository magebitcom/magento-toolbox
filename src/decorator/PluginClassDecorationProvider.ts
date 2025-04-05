import {
  DecorationOptions,
  MarkdownString,
  TextEditorDecorationType,
  window,
  Range,
  Uri,
} from 'vscode';
import path from 'path';
import MarkdownMessageBuilder from 'common/MarkdownMessageBuilder';
import PhpNamespace from 'common/PhpNamespace';
import TextDocumentDecorationProvider from './TextDocumentDecorationProvider';
import Position from 'util/Position';
import PluginSubjectInfo from 'common/php/PluginSubjectInfo';
import PluginInfo from 'common/php/PluginInfo';
import Magento from 'util/Magento';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';
import IndexManager from 'indexer/IndexManager';
import AutoloadNamespaceIndexer from 'indexer/autoload-namespace/AutoloadNamespaceIndexer';
import { AutoloadNamespaceIndexData } from 'indexer/autoload-namespace/AutoloadNamespaceIndexData';
import { DiPlugin } from 'indexer/di/types';
import PhpDocumentParser from 'common/php/PhpDocumentParser';

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
    const phpFile = await PhpDocumentParser.parse(this.document);

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

    const namespaceIndexData = IndexManager.getIndexData(AutoloadNamespaceIndexer.KEY);

    if (!namespaceIndexData) {
      return decorations;
    }

    const hoverMessage = await this.getInterceptorHoverMessage(classPlugins, namespaceIndexData);

    decorations.push({
      range: nameRange,
      hoverMessage,
    });

    const methodPlugins: Record<string, { plugin: DiPlugin; subjectMethod: PhpMethod }[]> = {};

    for (const plugin of classPlugins) {
      const fileUri = await namespaceIndexData.findUriByNamespace(
        PhpNamespace.fromString(plugin.type)
      );

      if (!fileUri) {
        continue;
      }

      const pluginPhpFile = await PhpDocumentParser.parseUri(this.document, fileUri);
      const pluginInfo = new PluginInfo(pluginPhpFile);
      const pluginMethods = pluginInfo.getPluginMethods(pluginPhpFile.classes[0]);

      for (const method of pluginMethods) {
        const subjectMethodName = Magento.pluginMethodToMethodName(method.name);
        const subjectMethod = classlikeInfo.getMethodByName(classLikeNode, subjectMethodName);

        if (!subjectMethod) {
          continue;
        }

        methodPlugins[subjectMethod.name] = methodPlugins[subjectMethod.name] || [];
        methodPlugins[subjectMethod.name].push({
          plugin,
          subjectMethod,
        });
      }
    }

    for (const [, plugins] of Object.entries(methodPlugins)) {
      const hoverMessage = await this.getInterceptorHoverMessage(
        plugins.map(p => p.plugin),
        namespaceIndexData
      );
      const subjectMethod = plugins[0].subjectMethod;

      if (typeof subjectMethod.ast.name === 'string' || !subjectMethod.ast.name.loc) {
        continue;
      }
      const range = new Range(
        Position.phpAstPositionToVsCodePosition(subjectMethod.ast.name.loc.start),
        Position.phpAstPositionToVsCodePosition(subjectMethod.ast.name.loc.end)
      );

      decorations.push({
        range,
        hoverMessage,
      });
    }

    return decorations;
  }

  private async getInterceptorHoverMessage(
    classInterceptors: DiPlugin[],
    namespaceIndexData: AutoloadNamespaceIndexData
  ): Promise<MarkdownString> {
    const message = MarkdownMessageBuilder.create('Interceptors');

    for (const interceptor of classInterceptors) {
      const fileUri = await namespaceIndexData.findUriByNamespace(
        PhpNamespace.fromString(interceptor.type)
      );

      const link = `[${interceptor.type}](${fileUri ? Uri.file(fileUri.fsPath) : '#'})`;
      message.appendMarkdown(`- ${link} [(di.xml)](${Uri.file(interceptor.diPath)})\n`);
    }

    return message.build();
  }
}
