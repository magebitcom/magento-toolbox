import { AbstractWizardCommand } from './AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import TemplateGenerator from 'generator/TemplateGenerator';
import SimpleTemplateWizard, { TemplateWizardData } from 'wizard/SimpleTemplateWizard';
import { MagentoScope } from 'types/global';
import { WizardField, WizardValidationRule } from 'types/webview';
import { TemplatePath } from 'types/handlebars';

export abstract class SimpleTemplateGeneratorCommand extends AbstractWizardCommand<TemplateWizardData> {
  abstract getWizardTitle(): string;

  abstract getFilePath(data: TemplateWizardData): string;

  abstract getTemplateName(data: TemplateWizardData): TemplatePath;

  public getAreas(): MagentoScope[] {
    return [];
  }

  public getFileHeader(_data: TemplateWizardData): string | undefined {
    return undefined;
  }

  public getWizardFields(): WizardField[] {
    return [];
  }

  public getWizardValidation(): Record<string, WizardValidationRule> {
    return {};
  }

  public getTemplateData(data: TemplateWizardData): Record<string, unknown> {
    return data;
  }

  protected showWizard(contextModule: string | undefined): Promise<TemplateWizardData> {
    return new SimpleTemplateWizard().show(
      this.getWizardTitle(),
      contextModule,
      this.getAreas(),
      this.getWizardFields(),
      this.getWizardValidation()
    );
  }

  protected buildGenerators(data: TemplateWizardData): FileGenerator[] {
    const templateData = {
      ...this.getTemplateData(data),
      fileHeader: this.getFileHeader(data) ?? '',
    };

    return [
      new TemplateGenerator(
        this.getFilePath(data),
        this.getTemplateName(data),
        templateData as never
      ),
    ];
  }
}
