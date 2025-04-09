import { DecorationOptions, TextEditorDecorationType, Uri, window } from 'vscode';
import path from 'path';
import TextDocumentDecorationProvider from './TextDocumentDecorationProvider';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpInterface } from 'parser/php/PhpInterface';
import PhpDocumentParser from 'common/php/PhpDocumentParser';
import { ClasslikeInfo } from 'common/php/ClasslikeInfo';
import MarkdownMessageBuilder from 'common/MarkdownMessageBuilder';
import IndexManager from 'indexer/IndexManager';
import CronIndexer from 'indexer/cron/CronIndexer';
import { Job } from 'indexer/cron/types';
import cronstrue from 'cronstrue';

export default class CronClassDecorationProvider extends TextDocumentDecorationProvider {
  public getType(): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
      gutterIconPath: path.join(__dirname, 'resources', 'icons', 'cron.svg'),
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

    const classlikeInfo = new ClasslikeInfo(phpFile);

    const cronIndexData = IndexManager.getIndexData(CronIndexer.KEY);

    if (!cronIndexData) {
      return decorations;
    }

    const jobs = cronIndexData.findJobsByInstance(classlikeInfo.getNamespace());

    if (jobs.length === 0) {
      return decorations;
    }

    decorations.push(...this.getCronInstanceDecorations(jobs, classlikeInfo));

    return decorations;
  }

  private getCronInstanceDecorations(
    jobs: Job[],
    classlikeInfo: ClasslikeInfo
  ): DecorationOptions[] {
    const decorations: DecorationOptions[] = [];

    const nameRange = classlikeInfo.getNameRange();

    if (!nameRange) {
      return decorations;
    }

    const hoverMessage = MarkdownMessageBuilder.create('Cron Jobs');

    for (const job of jobs) {
      hoverMessage.appendMarkdown(`- [${job.name}](${Uri.file(job.path)})\n`);
      hoverMessage.appendMarkdown(`  - Method: \`${job.method}\`\n`);

      if (job.schedule) {
        hoverMessage.appendMarkdown(
          `  - \`${job.schedule}\` (${cronstrue.toString(job.schedule)})\n`
        );
      }

      if (job.config_path) {
        hoverMessage.appendMarkdown(`  - Config: \`${job.config_path}\`\n`);
      }
    }

    decorations.push({
      range: nameRange,
      hoverMessage: hoverMessage.build(),
    });

    return decorations;
  }
}
