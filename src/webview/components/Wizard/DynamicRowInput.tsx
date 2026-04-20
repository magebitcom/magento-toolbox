import React from 'react';
import { WizardDynamicRowField, WizardField, WizardInput, WizardSelectField } from 'types/webview';
import { FieldRenderer } from './FieldRenderer';
import { FieldArray, useFormikContext } from 'formik';

interface Props {
  field: WizardDynamicRowField;
}

const emptyRowFromFields = (fields: WizardField[]): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  for (const child of fields) {
    if (child.type === WizardInput.Checkbox) {
      row[child.id] = (child as { initialValue?: boolean }).initialValue ?? false;
      continue;
    }
    if (child.type === WizardInput.Select && (child as WizardSelectField).multiple) {
      row[child.id] = (child as { initialValue?: unknown }).initialValue ?? [];
      continue;
    }
    row[child.id] = (child as { initialValue?: unknown }).initialValue ?? '';
  }
  return row;
};

const deriveItemLabel = (field: WizardDynamicRowField): string => {
  if (field.itemLabel) {
    return field.itemLabel;
  }
  // Fallback: strip a trailing 's' from the plural heading ("Sections" → "Section").
  if (field.label.length > 1 && field.label.endsWith('s')) {
    return field.label.slice(0, -1);
  }
  return 'Row';
};

export const DynamicRowInput: React.FC<Props> = ({ field }) => {
  const { values } = useFormikContext<any>();
  const rows = values[field.id] ?? ([] as Record<string, any>[]);
  const itemLabel = deriveItemLabel(field);

  return (
    <FieldArray
      name={field.id}
      render={arrayHelpers => (
        <div className="dynamic-row-list">
          {rows.length === 0 && (
            <p className="dynamic-row-empty">No rows — click Add Row to get started.</p>
          )}

          {rows.map((_row: any, index: number) => (
            <div key={`${field.id}-row-${index}`} className="dynamic-row-item">
              <div className="dynamic-row-item-header">
                <span className="dynamic-row-item-label">{`${itemLabel} ${index + 1}`}</span>
                <vscode-button secondary onClick={() => arrayHelpers.remove(index)}>
                  Remove
                </vscode-button>
              </div>
              <div className="dynamic-row-item-grid">
                {field.fields.map(childField => (
                  <FieldRenderer
                    key={`${field.id}-${index}-${childField.id}`}
                    prefix={`${field.id}.${index}`}
                    field={childField}
                  />
                ))}
              </div>
            </div>
          ))}

          <vscode-button
            className="dynamic-row-add-row"
            onClick={() => arrayHelpers.push(emptyRowFromFields(field.fields))}
          >
            Add Row
          </vscode-button>
        </div>
      )}
    />
  );
};
