import {
  FieldDependency,
  FieldValue,
  WizardField,
  WizardInput,
  WizardSelectOption,
} from 'types/webview';

export class WizardFieldBuilder {
  private placeholder: string | undefined = undefined;
  private initialValue: FieldValue | undefined = undefined;
  private multiple: boolean | undefined = false;
  private options: WizardSelectOption[] = [];

  public constructor(
    private type: WizardInput | undefined = undefined,
    private id: string | undefined = undefined,
    private label: string | undefined = undefined,
    private description: string[] | undefined = undefined,
    private dependsOn: FieldDependency | undefined = undefined,
    private fields: WizardField[] | undefined = undefined
  ) {}

  public static new(): WizardFieldBuilder {
    return new WizardFieldBuilder();
  }

  public static text(id?: string, label?: string): WizardFieldBuilder {
    return new WizardFieldBuilder(WizardInput.Text, id, label);
  }

  public static number(id?: string, label?: string): WizardFieldBuilder {
    return new WizardFieldBuilder(WizardInput.Number, id, label);
  }

  public static select(id?: string, label?: string): WizardFieldBuilder {
    return new WizardFieldBuilder(WizardInput.Select, id, label);
  }

  public static checkbox(id?: string, label?: string): WizardFieldBuilder {
    return new WizardFieldBuilder(WizardInput.Checkbox, id, label);
  }

  public static dynamicRow(id?: string, label?: string): WizardFieldBuilder {
    return new WizardFieldBuilder(WizardInput.DynamicRow, id, label);
  }

  public setId(id: string): WizardFieldBuilder {
    this.id = id;
    return this;
  }

  public setLabel(label: string): WizardFieldBuilder {
    this.label = label;
    return this;
  }

  public setDescription(description: string[]): WizardFieldBuilder {
    this.description = description;
    return this;
  }

  public addDescription(description: string): WizardFieldBuilder {
    if (!this.description) {
      this.description = [];
    }

    this.description.push(description);
    return this;
  }

  public setPlaceholder(placeholder: string): WizardFieldBuilder {
    this.placeholder = placeholder;
    return this;
  }

  public setInitialValue(initialValue?: FieldValue): WizardFieldBuilder {
    this.initialValue = initialValue;
    return this;
  }

  public addDependsOn(field: string, value: FieldValue): WizardFieldBuilder {
    this.dependsOn = { field, value };
    return this;
  }

  public addFields(fields: WizardField[]): WizardFieldBuilder {
    this.fields = fields;
    return this;
  }

  public addOption(option: WizardSelectOption): WizardFieldBuilder {
    this.options.push(option);
    return this;
  }

  public setOptions(options: WizardSelectOption[]): WizardFieldBuilder {
    this.options = options;
    return this;
  }

  public setMultiple(multiple: boolean): WizardFieldBuilder {
    this.multiple = multiple;
    return this;
  }

  public build(): WizardField {
    if (!this.id || !this.label || !this.type) {
      throw new Error('Invalid field');
    }

    switch (this.type) {
      case WizardInput.Number:
      case WizardInput.Text:
        return {
          id: this.id,
          label: this.label,
          description: this.description,
          dependsOn: this.dependsOn,
          placeholder: this.placeholder,
          initialValue: this.initialValue,
          type: this.type,
        };
      case WizardInput.Select:
        return {
          id: this.id,
          label: this.label,
          description: this.description,
          dependsOn: this.dependsOn,
          options: this.options,
          multiple: this.multiple,
          initialValue: this.initialValue,
          type: this.type,
        };
      case WizardInput.DynamicRow:
        return {
          id: this.id,
          label: this.label,
          description: this.description,
          dependsOn: this.dependsOn,
          fields: this.fields ?? [],
          type: this.type,
        };
      case WizardInput.Checkbox:
        return {
          id: this.id,
          label: this.label,
          description: this.description,
          dependsOn: this.dependsOn,
          initialValue: this.initialValue,
          type: this.type,
        };
      default:
        throw new Error('Invalid field type');
    }
  }
}
