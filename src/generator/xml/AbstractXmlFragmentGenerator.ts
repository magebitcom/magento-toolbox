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
    const merged =
      existingXml.slice(0, insertPosition) +
      '\n' +
      indented +
      '\n' +
      existingXml.slice(insertPosition);

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, merged, false);
  }
}
