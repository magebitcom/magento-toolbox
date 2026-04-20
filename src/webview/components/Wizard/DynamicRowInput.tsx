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

export const DynamicRowInput: React.FC<Props> = ({ field }) => {
  const { values } = useFormikContext<any>();
  const rows = values[field.id] ?? ([] as Record<string, any>[]);

  return (
    <FieldArray
      name={field.id}
      render={arrayHelpers => (
        <>
          <table className="dynamic-row-table">
            <thead>
              <tr>
                {field.fields.map(child => (
                  <th key={`${child.id}-header`}>{child.label}</th>
                ))}
                <th className="dynamic-row-action-header">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((_row: any, index: number) => (
                <tr key={`${field.id}-row-${index}`}>
                  {field.fields.map(childField => (
                    <td className="dynamic-row-cell" key={`${field.id}-${index}-${childField.id}`}>
                      <FieldRenderer prefix={`${field.id}.${index}`} field={childField} simple />
                    </td>
                  ))}
                  <td className="dynamic-row-cell dynamic-row-action">
                    <vscode-button secondary onClick={() => arrayHelpers.remove(index)}>
                      Remove
                    </vscode-button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="dynamic-row-empty" colSpan={field.fields.length + 1}>
                    No rows — click Add Row to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <vscode-button
            className="dynamic-row-add-row"
            onClick={() => arrayHelpers.push(emptyRowFromFields(field.fields))}
          >
            Add Row
          </vscode-button>
        </>
      )}
    />
  );
};
