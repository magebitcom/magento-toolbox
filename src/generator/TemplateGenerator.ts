import { Uri } from 'vscode';
import FileGenerator from './FileGenerator';
import GeneratedFile from './GeneratedFile';
import HandlebarsTemplateRenderer from './HandlebarsTemplateRenderer';
import { TemplatePath, TemplateParams } from 'types/handlebars';

export default class TemplateGenerator<
  T extends TemplatePath,
  P extends TemplateParams[T] = TemplateParams[T],
> extends FileGenerator {
  protected renderer: HandlebarsTemplateRenderer | undefined;

  public constructor(
    protected fileName: string,
    protected templateName: T,
    protected data: P
  ) {
    super();
  }

  public getTemplateData(): P {
    return this.data;
  }

  protected getTemplateRenderer(): HandlebarsTemplateRenderer {
    if (!this.renderer) {
      this.renderer = new HandlebarsTemplateRenderer();
    }

    return this.renderer;
  }

  protected getTemplateContent(): Promise<string> {
    return this.getTemplateRenderer().render(this.templateName, this.getTemplateData());
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = await this.getTemplateContent();

    const path = Uri.joinPath(workspaceUri, this.fileName);
    return new GeneratedFile(path, content);
  }
}
