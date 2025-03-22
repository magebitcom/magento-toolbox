import { ErrorMessages, Rules, TypeCheckingRule } from 'validatorjs';
import { Wizard, WizardTab } from 'types/webview';

export class WizardFormBuilder {
  private title?: string;
  private description?: string;
  private tabs: WizardTab[] = [];
  private validation: Rules = {};
  private validationMessages: ErrorMessages = {};

  public static new(): WizardFormBuilder {
    return new WizardFormBuilder();
  }

  public addTab(tab: WizardTab): void {
    this.tabs.push(tab);
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public addValidation(
    field: string,
    rule: string | Array<string | TypeCheckingRule> | Rules
  ): void {
    this.validation[field] = rule;
  }

  public addValidationMessage(field: string, message: string): void {
    this.validationMessages[field] = message;
  }

  public build(): Wizard {
    if (!this.title) {
      throw new Error('Title is required');
    }

    if (!this.tabs.length) {
      throw new Error('Tabs are required');
    }

    return {
      title: this.title,
      description: this.description,
      tabs: this.tabs,
      validation: this.validation,
      validationMessages: this.validationMessages,
    };
  }
}
