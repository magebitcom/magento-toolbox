import { Uri } from 'vscode';
import indentString from 'indent-string';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import FindOrCreateXml, { XmlFileSpec } from './FindOrCreateXml';

export interface XmlFragmentContext {
  workspaceUri: Uri;
  vendor: string;
  module: string;
  existingXml: string;
}

export default abstract class AbstractXmlFragmentGenerator<
  TData extends { module: string },
> extends FileGenerator {
  public constructor(protected data: TData) {
    super();
  }

  protected abstract getTarget(): XmlFileSpec;

  protected abstract renderFragment(
    renderer: HandlebarsTemplateRenderer,
    context: XmlFragmentContext
  ): Promise<string>;

  protected computeInsertPosition(xml: string): number {
    return xml.indexOf('</config>');
  }

  protected getIndent(): number {
    return 4;
  }

  /**
   * Characters wrapped around the inserted fragment. Default produces a blank
   * line before and after by adding `\n` on each side (since typical insert
   * points already have surrounding newlines). Override to tighten the gap —
   * e.g. inserting a sibling into a non-blank-separated list.
   */
  protected getFragmentSeparator(
    _existingXml: string,
    _insertPosition: number
  ): { before: string; after: string } {
    return { before: '\n', after: '\n' };
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target = this.getTarget();

    const existingXml = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const renderer = new HandlebarsTemplateRenderer();
    const fragment = await this.renderFragment(renderer, {
      workspaceUri,
      vendor,
      module,
      existingXml,
    });

    const insertPosition = this.computeInsertPosition(existingXml);
    const indented = indentString(fragment, this.getIndent());
    const { before, after } = this.getFragmentSeparator(existingXml, insertPosition);
    const merged =
      existingXml.slice(0, insertPosition) +
      before +
      indented +
      after +
      existingXml.slice(insertPosition);

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, merged, false);
  }
}
