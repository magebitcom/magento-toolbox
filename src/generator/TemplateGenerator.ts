import { renderFile } from 'ejs';
import { resolve } from 'path';
import { Uri } from 'vscode';
import ModuleFileGenerator from './ModuleFileGenerator';
import GeneratedFile from './GeneratedFile';

export default class TemplateGenerator extends ModuleFileGenerator {
  public constructor(
    protected fileName: string,
    protected templateName: string,
    protected data: any
  ) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = await renderFile<Promise<string>>(this.getTemplateDirectory(), this.data);

    const path = Uri.joinPath(workspaceUri, this.fileName);
    return new GeneratedFile(path, content);
  }

  private getTemplateDirectory(): string {
    return resolve(__dirname, 'templates', this.templateName + '.ejs');
  }
}
