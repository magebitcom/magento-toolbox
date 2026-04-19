import { WizardSelectOption } from 'types/webview';

export const EAV_ATTRIBUTE_TYPE_OPTIONS: WizardSelectOption[] = [
  { label: 'varchar (string up to 255)', value: 'varchar' },
  { label: 'text (long text)', value: 'text' },
  { label: 'int', value: 'int' },
  { label: 'decimal', value: 'decimal' },
  { label: 'datetime', value: 'datetime' },
  { label: 'static', value: 'static' },
];

export const EAV_ATTRIBUTE_INPUT_OPTIONS: WizardSelectOption[] = [
  { label: 'text', value: 'text' },
  { label: 'textarea', value: 'textarea' },
  { label: 'select', value: 'select' },
  { label: 'multiselect', value: 'multiselect' },
  { label: 'boolean (Yes/No)', value: 'boolean' },
  { label: 'date', value: 'date' },
  { label: 'datetime', value: 'datetime' },
  { label: 'price', value: 'price' },
  { label: 'image', value: 'image' },
];

export const PRODUCT_ATTRIBUTE_SCOPE_OPTIONS: WizardSelectOption[] = [
  { label: 'Global', value: 'SCOPE_GLOBAL' },
  { label: 'Website', value: 'SCOPE_WEBSITE' },
  { label: 'Store View', value: 'SCOPE_STORE' },
];

export const CUSTOMER_ATTRIBUTE_FORM_OPTIONS: WizardSelectOption[] = [
  { label: 'Admin: customer edit', value: 'adminhtml_customer' },
  { label: 'Storefront: customer register', value: 'customer_account_create' },
  { label: 'Storefront: customer edit', value: 'customer_account_edit' },
];
