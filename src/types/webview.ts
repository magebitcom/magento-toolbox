import { ErrorMessages, Rules, TypeCheckingRule } from 'validatorjs';

export enum Page {
  Wizard = 'wizard',
}

export enum Command {
  Ready = 'ready',
  ShowWizard = 'showWizard',
  Submit = 'submit',
  Cancel = 'cancel',
  Preview = 'preview',
  PreviewResult = 'previewResult',
  ShowSwitcher = 'showSwitcher',
}

export type PreviewFileAction = 'create' | 'modify';

export interface PreviewFile {
  path: string;
  action: PreviewFileAction;
}

export interface PreviewResult {
  files: PreviewFile[];
  error?: string;
}

export interface Message<T = any> {
  command: Command;
  data: T;
}

export interface WizardAssets {
  logoUri: string;
}

export interface ShowWizardMessage {
  command: Command.ShowWizard;
  data: Wizard;
  assets: WizardAssets;
}

export type WizardMessage = Message<Wizard>;

export interface Wizard {
  title: string;
  description?: string;
  submitLabel?: string;
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
  | WizardDynamicRowField
  | WizardAutocompleteField;

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
  /** Singular noun used in row headings, e.g. "Section" → "Section 1". */
  itemLabel?: string;
}

/**
 * Describes where an autocomplete should pull its suggestions from. `fieldId`
 * is the id of a sibling DynamicRow field (at the wizard root); `column` is
 * the per-row property to collect values from. An optional `filterBy` narrows
 * the rows — e.g. for Fields → Group, you want to see only groups belonging
 * to the section currently typed into the same row.
 */
export interface DynamicSuggestionsSource {
  fieldId: string;
  column: string;
  filterBy?: {
    column: string;
    fromField: string;
  };
}

export interface WizardAutocompleteField extends WizardGenericField {
  type: WizardInput.Autocomplete;
  placeholder?: string;
  suggestions?: string[];
  suggestionsFrom?: DynamicSuggestionsSource;
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
  Autocomplete = 'autocomplete',
}

export interface WizardSelectOption {
  label: string;
  value: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}
