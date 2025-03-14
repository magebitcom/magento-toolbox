import { Uri } from 'vscode';
import FileGenerator from './FileGenerator';
import GeneratedFile from './GeneratedFile';
import HandlebarsTemplateRenderer from './HandlebarsTemplateRenderer';

export default class TemplateGenerator extends FileGenerator {
  protected renderer: HandlebarsTemplateRenderer | undefined;

  public constructor(
    protected fileName: string,
    protected templateName: string,
    protected data: Record<string, any>
  ) {
    super();
  }

  public getTemplateData(): Record<string, any> {
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
