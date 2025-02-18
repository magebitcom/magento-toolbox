import { WizardField, WizardTab } from './types';

export class WizardTabBuilder {
  private id?: string;
  private title?: string;
  private description?: string;
  private fields: WizardField[] = [];

  public static new(): WizardTabBuilder {
    return new WizardTabBuilder();
  }

  public setId(id: string): void {
    this.id = id;
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

  public build(): WizardTab {
    if (!this.id) {
      throw new Error('Id is required');
    }

    if (!this.title) {
      throw new Error('Title is required');
    }

    if (!this.fields.length) {
      throw new Error('Fields are required');
    }

    return {
      id: this.id,
      title: this.title,
      description: this.description,
      fields: this.fields,
    };
  }
}
