import { Uri } from 'vscode';
import ModuleFileGenerator from './ModuleFileGenerator';
import GeneratedFile from './GeneratedFile';
import GenerateFromTemplate from './util/GenerateFromTemplate';

export default class TemplateGenerator extends ModuleFileGenerator {
  public constructor(
    protected fileName: string,
    protected templateName: string,
    protected data: any
  ) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const content = await GenerateFromTemplate.generate(this.templateName, this.data);

    const path = Uri.joinPath(workspaceUri, this.fileName);
    return new GeneratedFile(path, content);
  }
}
