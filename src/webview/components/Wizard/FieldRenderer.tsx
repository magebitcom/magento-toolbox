import { Option } from '@vscode-elements/elements/dist/includes/vscode-select/types';
import { useField, useFormikContext } from 'formik';
import { useEffect, useMemo, useRef } from 'react';
import { WizardField, WizardInput, WizardSelectOption } from 'webview/types';
import { DynamicRowInput } from './DynamicRowInput';
import { FieldErrorMessage } from './FieldErrorMessage';

interface Props {
  field: WizardField;
  prefix?: string;
  simple?: boolean;
}

const getFieldId = (field: WizardField, prefix?: string) => {
  if (prefix) {
    return `${prefix}.${field.id}`;
  }

  return field.id;
};

const getFieldProps = (field: WizardField, prefix?: string) => {
  switch (field.type) {
    case WizardInput.Readonly:
      return { readonly: true };
    case WizardInput.Checkbox:
      return { name: getFieldId(field, prefix), checked: false };
    case WizardInput.Select:
      return { name: getFieldId(field, prefix) };
    case WizardInput.DynamicRow:
      return { name: getFieldId(field, prefix) };
    default:
      return {
        name: getFieldId(field, prefix),
        placeholder: field.placeholder,
      };
  }
};

const mapOption = (option: WizardSelectOption): Option => {
  return {
    label: option.label,
    value: option.value,
    description: option.description ?? '',
    selected: option.selected ?? false,
    disabled: option.disabled ?? false,
  };
};

export const FieldRenderer: React.FC<Props> = ({ field, simple = false, prefix }) => {
  const { values } = useFormikContext<any>();
  const el = useRef<any>(null);
  const [fieldProps, meta] = useField(getFieldProps(field, prefix));

  /**
   * vscode-elements do not support (yet) onChange prop
   */
  useEffect(() => {
    if (!el.current) {
      return;
    }

    el.current.addEventListener('change', fieldProps.onChange);

    return () => {
      el.current?.removeEventListener('change', fieldProps.onChange);
    };
  }, [fieldProps, el.current]);

  const fieldInner = useMemo(() => {
    switch (field.type) {
      case WizardInput.Readonly:
      case WizardInput.Number:
      case WizardInput.Text: {
        return <vscode-textfield placeholder={field.placeholder} {...fieldProps} ref={el} />;
      }
      case WizardInput.Select: {
        const selectedIndex = field.initialValue
          ? field.options.findIndex(option => option.value === String(field.initialValue))
          : undefined;

        if (field.multiple) {
          return (
            <vscode-multi-select
              {...fieldProps}
              ref={el}
              combobox
              value={field.initialValue ? [String(field.initialValue)] : undefined}
              options={field.options.map(mapOption)}
              selectedIndexes={selectedIndex ? [selectedIndex] : undefined}
            />
          );
        }

        return (
          <vscode-single-select
            {...fieldProps}
            ref={el}
            combobox
            selectedIndex={selectedIndex}
            options={field.options.map(mapOption)}
          />
        );
      }
      case WizardInput.DynamicRow: {
        return <DynamicRowInput field={field} />;
      }
      case WizardInput.Checkbox: {
        return <vscode-checkbox {...fieldProps} ref={el} />;
      }
    }

    return null;
  }, []);

  if (field.dependsOn && values[field.dependsOn.field] !== field.dependsOn.value) {
    return null;
  }

  if (fieldInner) {
    if (simple) {
      return (
        <>
          {fieldInner}
          <vscode-form-helper>
            <p className="error">
              <FieldErrorMessage name={fieldProps.name} />
            </p>
          </vscode-form-helper>
        </>
      );
    }

    return (
      <vscode-form-group>
        {field.type !== WizardInput.DynamicRow && <vscode-label>{field.label}</vscode-label>}
        {field.type === WizardInput.DynamicRow && (
          <div className="dynamic-row-title">{field.label}</div>
        )}
        {fieldInner}
        <vscode-form-helper>
          {meta.touched && meta.error && <p className="error">{meta.error}</p>}
          <p>{field.description}</p>
        </vscode-form-helper>
      </vscode-form-group>
    );
  }

  return null;
};
