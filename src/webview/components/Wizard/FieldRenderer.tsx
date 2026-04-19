import { Option } from '@vscode-elements/elements/dist/includes/vscode-select/types';
import { useField, useFormikContext } from 'formik';
import { useEffect, useMemo, useRef } from 'react';
import { WizardField, WizardInput, WizardSelectOption } from 'types/webview';
import { DynamicRowInput } from './DynamicRowInput';
import { FieldErrorMessage } from './FieldErrorMessage';

interface Props {
  field: WizardField;
  prefix?: string;
  simple?: boolean;
}

const getFieldId = (field: WizardField, prefix?: string) => {
  return prefix ? `${prefix}.${field.id}` : field.id;
};

const getFieldProps = (field: WizardField, prefix?: string) => {
  const name = getFieldId(field, prefix);
  switch (field.type) {
    case WizardInput.Checkbox:
      return { name, type: 'checkbox' as const };
    case WizardInput.Select:
    case WizardInput.DynamicRow:
      return { name };
    default:
      return { name, placeholder: field.placeholder };
  }
};

const mapOption = (option: WizardSelectOption): Option => ({
  label: option.label,
  value: option.value,
  description: option.description ?? '',
  selected: option.selected ?? false,
  disabled: option.disabled ?? false,
});

export const FieldRenderer: React.FC<Props> = ({ field, simple = false, prefix }) => {
  const { values } = useFormikContext<any>();
  const el = useRef<any>(null);
  const [fieldProps, meta, helpers] = useField(getFieldProps(field, prefix));
  const { setValue, setTouched } = helpers;

  // Bridge the custom element's native change/input events to Formik. Read the
  // element's value/checked properties directly rather than trusting
  // event.target.value — some @vscode-elements components surface the value
  // only on the element property, not on the event.
  useEffect(() => {
    const node = el.current;
    if (!node) {
      return;
    }

    const commit = () => {
      if (field.type === WizardInput.Checkbox) {
        setValue(Boolean(node.checked));
        return;
      }
      if (field.type === WizardInput.Select && field.multiple) {
        const next = Array.isArray(node.value) ? node.value : [];
        setValue(next);
        return;
      }
      setValue(node.value ?? '');
    };

    const onBlur = () => setTouched(true);

    node.addEventListener('change', commit);
    node.addEventListener('input', commit);
    node.addEventListener('blur', onBlur);

    return () => {
      node.removeEventListener('change', commit);
      node.removeEventListener('input', commit);
      node.removeEventListener('blur', onBlur);
    };
  }, [setValue, setTouched, field.type, (field as { multiple?: boolean }).multiple]);

  // Push the Formik value back onto the custom element whenever it changes
  // from outside user interaction (initial mount, programmatic updates,
  // Add Row defaults).
  useEffect(() => {
    const node = el.current;
    if (!node) {
      return;
    }
    if (field.type === WizardInput.Checkbox) {
      const wanted = Boolean((fieldProps as { value?: unknown }).value);
      if (node.checked !== wanted) {
        node.checked = wanted;
      }
      return;
    }
    if (field.type === WizardInput.Select && field.multiple) {
      const next = Array.isArray(fieldProps.value) ? fieldProps.value : [];
      try {
        node.value = next;
      } catch {
        /* some builds reject array assignment — safe to ignore */
      }
      return;
    }
    const next = fieldProps.value ?? '';
    if (node.value !== next) {
      node.value = next;
    }
  }, [fieldProps.value, field.type, (field as { multiple?: boolean }).multiple]);

  const options = useMemo(() => {
    if (field.type !== WizardInput.Select) {
      return [];
    }
    return field.options.map(mapOption);
  }, [field]);

  const fieldInner = useMemo(() => {
    switch (field.type) {
      case WizardInput.Readonly:
        return (
          <vscode-textfield
            placeholder={field.placeholder}
            name={fieldProps.name}
            readonly
            ref={el}
          />
        );
      case WizardInput.Number:
        return (
          <vscode-textfield
            type="number"
            placeholder={field.placeholder}
            name={fieldProps.name}
            ref={el}
          />
        );
      case WizardInput.Text:
        return <vscode-textfield placeholder={field.placeholder} name={fieldProps.name} ref={el} />;
      case WizardInput.Select:
        if (field.multiple) {
          return (
            <vscode-multi-select
              name={fieldProps.name}
              ref={el}
              {...(field.search ? { combobox: true } : {})}
              options={options}
            />
          );
        }
        return (
          <vscode-single-select
            name={fieldProps.name}
            ref={el}
            {...(field.search ? { combobox: true } : {})}
            options={options}
          />
        );
      case WizardInput.DynamicRow:
        return <DynamicRowInput field={field} />;
      case WizardInput.Checkbox:
        return <vscode-checkbox name={fieldProps.name} ref={el} />;
    }
    return null;
  }, [field, fieldProps.name, options]);

  if (field.dependsOn && values[field.dependsOn.field] !== field.dependsOn.value) {
    return null;
  }

  if (!fieldInner) {
    return null;
  }

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
        {field.description && field.description.length > 0 && (
          <div className="field-description">
            {field.description.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        )}
      </vscode-form-helper>
    </vscode-form-group>
  );
};
