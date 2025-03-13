import { create } from 'handlebars';
import { resolve } from 'path';
import FileSystem from 'util/FileSystem';
import { Uri } from 'vscode';
import Logger from 'util/Logger';

export default class GenerateFromTemplate {
  public static async generate(template: string, data?: Record<string, any>): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(template);
      const templateContent = await FileSystem.readFile(Uri.file(templatePath));
      const handlebars = create();
      this.registerHelpers(handlebars);
      this.registerPartials(handlebars);
      const compiledTemplate = handlebars.compile(templateContent);
      const content = compiledTemplate(data);
      return content;
    } catch (error) {
      Logger.log('Failed to generate template', String(error));
      throw error;
    }
  }

  protected static getTemplatePath(templateName: string): string {
    return resolve(FileSystem.getExtensionPath('templates/handlebars'), templateName + '.hbs');
  }

  protected static registerHelpers(handlebars: typeof Handlebars): void {
    handlebars.registerHelper('ifeq', (a: string, b: string, options: any) => {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  protected static registerPartials(handlebars: typeof Handlebars): void {
    handlebars.registerPartial('fileHeader', '{{#if fileHeader}}\n{{{fileHeader}}}\n{{/if}}');
  }
}
