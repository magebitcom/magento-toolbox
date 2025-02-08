import { renderFile } from 'ejs';
import { resolve } from 'path';

class GenerateFromTemplate {
  public async generate(template: string, data?: any): Promise<string> {
    const content = await renderFile<Promise<string>>(this.getTemplateDirectory(template), data);
    return content;
  }

  private getTemplateDirectory(templateName: string): string {
    return resolve(__dirname, 'templates', templateName + '.ejs');
  }
}

export default new GenerateFromTemplate();
