import { ErrorMessages, Rules, TypeCheckingRule } from 'validatorjs';

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
  tabs: WizardTab[];
  validationSchema?: any;
  validation?: Rules;
  validationMessages?: ErrorMessages;
}

export type WizardValidationRule = string | Array<string | TypeCheckingRule> | Rules;

export interface WizardTab {
  id: string;
  title: string;
  description?: string;
  fields: WizardField[];
}

export type WizardField =
  | WizardTextField
  | WizardNumberField
  | WizardSelectField
  | WizardReadonlyField
  | WizardCheckboxField
  | WizardDynamicRowField;

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

export interface WizardDynamicRowField extends WizardGenericField {
  type: WizardInput.DynamicRow;
  fields: WizardField[];
}

export type FieldValue = string | number | boolean | Record<string, string | number | boolean>;

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
  DynamicRow = 'dynamic-row',
}

export interface WizardSelectOption {
  label: string;
  value: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}
