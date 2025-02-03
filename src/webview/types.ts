import { ErrorMessages, Rules } from 'validatorjs';

export enum Page {
  Wizard = 'wizard',
}

export enum Command {
  Ready = 'ready',
  ShowWizard = 'showWizard',
  Submit = 'submit',
}

export interface Message<T = any> {
  command: Command;
  data: T;
}

export type WizardMessage = Message<Wizard>;

export interface Wizard {
  title: string;
  description?: string;
  fields: WizardField[];
  validationSchema?: any;
  validation?: Rules;
  validationMessages?: ErrorMessages;
}

export type WizardField =
  | WizardTextField
  | WizardNumberField
  | WizardSelectField
  | WizardReadonlyField
  | WizardCheckboxField;

export interface WizardTextField extends WizardGenericField {
  type: WizardInput.Text;
  placeholder?: string;
}

export interface WizardNumberField extends WizardGenericField {
  type: WizardInput.Number;
  placeholder?: string;
}

export interface WizardReadonlyField extends WizardGenericField {
  type: WizardInput.Readonly;
  placeholder?: string;
}

export interface WizardSelectField extends WizardGenericField {
  type: WizardInput.Select;
  options: WizardSelectOption[];
  multiple?: boolean;
  search?: boolean;
}

export interface WizardCheckboxField extends WizardGenericField {
  type: WizardInput.Checkbox;
}

export type FieldValue = string | number | boolean;

export interface FieldDependency {
  field: string;
  value: FieldValue;
}

export interface WizardGenericField {
  id: string;
  label: string;
  description?: string[];
  initialValue?: FieldValue;
  dependsOn?: FieldDependency;
}

export enum WizardInput {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  Checkbox = 'checkbox',
  Readonly = 'readonly',
}

export interface WizardSelectOption {
  label: string;
  value: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}
