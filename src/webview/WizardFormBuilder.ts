import { ErrorMessages, Rules, TypeCheckingRule } from 'validatorjs';
import { Wizard, WizardField } from './types';

export class WizardFormBuilder {
  private title?: string;
  private description?: string;
  private fields: WizardField[] = [];
  private validation: Rules = {};
  private validationMessages: ErrorMessages = {};

  public static new(): WizardFormBuilder {
    return new WizardFormBuilder();
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public addField(field: WizardField): void {
    this.fields.push(field);
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

    if (!this.fields.length) {
      throw new Error('Fields are required');
    }

    return {
      title: this.title,
      description: this.description,
      fields: this.fields,
      validation: this.validation,
      validationMessages: this.validationMessages,
    };
  }
}
