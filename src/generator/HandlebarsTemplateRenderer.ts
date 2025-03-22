import { create } from 'handlebars';
import { resolve } from 'path';
import FileSystem from 'util/FileSystem';
import { Uri } from 'vscode';
import Logger from 'util/Logger';

export default class HandlebarsTemplateRenderer {
  protected handlebars: typeof Handlebars;

  public constructor() {
    this.handlebars = create();
    this.registerHelpers();
    this.registerGlobalPartials();
  }

  public async render(
    template: string,
    data?: Record<string, any>,
    partials?: Record<string, string>
  ): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(template);
      const templateContent = await FileSystem.readFile(Uri.file(templatePath));

      if (partials) {
        for (const [name, content] of Object.entries(partials)) {
          this.handlebars.registerPartial(name, content + '\n');
        }
      }

      const compiledTemplate = this.handlebars.compile(templateContent);
      const content = compiledTemplate(data);
      return content;
    } catch (error) {
      Logger.log('Failed to generate template', String(error));
      throw error;
    }
  }

  public getTemplatePath(templateName: string): string {
    return resolve(FileSystem.getExtensionPath('templates/handlebars'), templateName + '.hbs');
  }

  protected registerHelpers(): void {
    this.handlebars.registerHelper('ifeq', (a: string, b: string, options: any) => {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  protected registerGlobalPartials(): void {
    this.handlebars.registerPartial('fileHeader', '{{#if fileHeader}}\n{{{fileHeader}}}\n{{/if}}');
  }
}
