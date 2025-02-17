import { render } from 'ejs';
import { resolve } from 'path';
import FileSystem from 'util/FileSystem';
import { Uri } from 'vscode';
export default class GenerateFromTemplate {
  public static async generate(template: string, data?: any): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(template);
      const templateContent = await FileSystem.readFile(Uri.file(templatePath));
      const content = render(templateContent, data);
      return content;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  protected static getTemplatePath(templateName: string): string {
    return resolve(__dirname, 'templates', templateName + '.ejs');
  }
}
