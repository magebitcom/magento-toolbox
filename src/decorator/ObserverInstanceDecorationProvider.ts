import { DecorationOptions, TextEditorDecorationType, Uri, window } from 'vscode';
import path from 'path';
import TextDocumentDecorationProvider from './TextDocumentDecorationProvider';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';
import ObserverClassInfo from 'common/php/ObserverClassInfo';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import MarkdownMessageBuilder from 'common/MarkdownMessageBuilder';
import Position from 'util/Position';
import { NodeKind } from 'parser/php/Parser';
import IndexManager from 'indexer/IndexManager';
import EventsIndexer from 'indexer/events/EventsIndexer';

export default class ObserverInstanceDecorationProvider extends TextDocumentDecorationProvider {
  public getType(): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
      gutterIconPath: path.join(__dirname, 'resources', 'icons', 'observer.svg'),
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

    const observerClassInfo = new ObserverClassInfo(phpFile);
    const classlikeInfo = new ClasslikeInfo(phpFile);

    if (this.isObserverInstance(classlikeInfo)) {
      decorations.push(...this.getObserverInstanceDecorations(observerClassInfo, classlikeInfo));
    }

    decorations.push(...this.getEventDispatchDecorations(observerClassInfo));

    return decorations;
  }

  private getEventDispatchDecorations(observerClassInfo: ObserverClassInfo): DecorationOptions[] {
    const decorations: DecorationOptions[] = [];

    const eventDispatchCalls = observerClassInfo.getEventDispatchCalls();

    if (eventDispatchCalls.length === 0) {
      return decorations;
    }

    const eventsIndexData = IndexManager.getIndexData(EventsIndexer.KEY);

    if (!eventsIndexData) {
      return decorations;
    }

    for (const eventDispatchCall of eventDispatchCalls) {
      const args = eventDispatchCall.arguments;

      if (args.length === 0) {
        continue;
      }

      const firstArg = args[0];

      if (!firstArg || firstArg.kind !== NodeKind.String || !firstArg.loc) {
        continue;
      }

      const eventName = (firstArg as any).value;

      const event = eventsIndexData.getEventByName(eventName);

      if (!event) {
        continue;
      }

      const range = Position.phpAstLocationToVsCodeRange(firstArg.loc);
      const hoverMessage = MarkdownMessageBuilder.create('Event observers');

      for (const observer of event.observers) {
        hoverMessage.appendMarkdown(`- [${observer.instance}](${Uri.file(event.diPath)})\n`);
      }

      decorations.push({
        range,
        hoverMessage: hoverMessage.build(),
      });
    }

    return decorations;
  }

  private getObserverInstanceDecorations(
    observerClassInfo: ObserverClassInfo,
    classlikeInfo: ClasslikeInfo
  ): DecorationOptions[] {
    const decorations: DecorationOptions[] = [];

    const observerEvents = observerClassInfo.getObserverEvents();

    if (observerEvents.length === 0) {
      return decorations;
    }

    const nameRange = classlikeInfo.getNameRange();

    if (!nameRange) {
      return decorations;
    }

    const hoverMessage = MarkdownMessageBuilder.create('Observer Events');

    for (const event of observerEvents) {
      hoverMessage.appendMarkdown(`- [${event.name}](${Uri.file(event.diPath)})\n`);
    }

    decorations.push({
      range: nameRange,
      hoverMessage: hoverMessage.build(),
    });

    return decorations;
  }

  private isObserverInstance(classlikeInfo: ClasslikeInfo): boolean {
    const imp = classlikeInfo.getImplements();

    return (
      imp.includes('Magento\\Framework\\Event\\ObserverInterface') ||
      imp.includes('ObserverInterface')
    );
  }
}
