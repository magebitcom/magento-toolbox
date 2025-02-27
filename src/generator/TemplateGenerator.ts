import { Uri } from 'vscode';
import FileGenerator from './FileGenerator';
import GeneratedFile from './GeneratedFile';
import GenerateFromTemplate from './util/GenerateFromTemplate';

export default class TemplateGenerator extends FileGenerator {
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

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = await GenerateFromTemplate.generate(this.templateName, this.getTemplateData());

    const path = Uri.joinPath(workspaceUri, this.fileName);
    return new GeneratedFile(path, content);
  }
}
