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
          {/* @ts-ignore */}
          <vscode-table zebra>
            <vscode-table-header slot="header">
              {field.fields.map(child => (
                <vscode-table-header-cell key={`${child.id}-header`}>
                  {child.label}
                </vscode-table-header-cell>
              ))}
              <vscode-table-header-cell key="action-header">Action</vscode-table-header-cell>
            </vscode-table-header>

            <vscode-table-body slot="body">
              {rows.map((_row: any, index: number) => (
                <vscode-table-row key={`${field.id}-row-${index}`}>
                  {field.fields.map(childField => (
                    <vscode-table-cell
                      className="dynamic-row-cell"
                      key={`${field.id}-${index}-${childField.id}`}
                    >
                      <FieldRenderer prefix={`${field.id}.${index}`} field={childField} simple />
                    </vscode-table-cell>
                  ))}
                  <vscode-table-cell className="dynamic-row-cell" key="action-row">
                    <vscode-button secondary onClick={() => arrayHelpers.remove(index)}>
                      Remove
                    </vscode-button>
                  </vscode-table-cell>
                </vscode-table-row>
              ))}
            </vscode-table-body>
          </vscode-table>
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
