import { Option } from '@vscode-elements/elements/dist/includes/vscode-select/types';
import { useField, useFormikContext } from 'formik';
import { useEffect, useMemo, useRef } from 'react';
import { WizardField, WizardInput, WizardSelectOption } from 'webview/types';

interface Props {
  field: WizardField;
}

const getFieldProps = (field: WizardField) => {
  switch (field.type) {
    case WizardInput.Readonly:
      return { readonly: true };
    case WizardInput.Checkbox:
      return { name: field.id, checked: false };
    case WizardInput.Select:
      return { name: field.id };
    default:
      return {
        name: field.id,
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

export const FieldRenderer: React.FC<Props> = ({ field }) => {
  const { values } = useFormikContext<any>();
  const el = useRef<any>(null);
  const [fieldProps, meta] = useField(getFieldProps(field));

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
            selectedIndex={selectedIndex}
            options={field.options.map(mapOption)}
          />
        );
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
    return (
      <vscode-form-group>
        <vscode-label>{field.label}</vscode-label>
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
