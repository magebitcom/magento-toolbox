import React, { useEffect, useState } from 'react';
import { WizardDynamicRowField, WizardField } from 'webview/types';
import { FieldRenderer } from './FieldRenderer';
import { FieldArray, useFormikContext } from 'formik';

interface Props {
  field: WizardDynamicRowField;
}

export const DynamicRowInput: React.FC<Props> = ({ field }) => {
  const { values } = useFormikContext<any>();
  const rows = values[field.id] ?? ([] as Record<string, any>[]);

  return (
    <FieldArray
      name={field.id}
      render={arrayHelpers => {
        return (
          <>
            {/* @ts-ignore */}
            <vscode-table zebra>
              <vscode-table-header slot="header">
                {field.fields.map(field => (
                  <vscode-table-header-cell key={`${field.id}-header`}>
                    {field.label}
                  </vscode-table-header-cell>
                ))}
                <vscode-table-header-cell key="action-header">Action</vscode-table-header-cell>
              </vscode-table-header>

              <vscode-table-body slot="body">
                {rows.map((row: any, index: number) => (
                  <vscode-table-row key={`row-${index}`}>
                    {field.fields.map(childField => (
                      <vscode-table-cell
                        className="dynamic-row-cell"
                        key={`${row.id}-${childField.id}`}
                      >
                        <FieldRenderer prefix={`${field.id}.${index}`} field={childField} simple />
                      </vscode-table-cell>
                    ))}
                    <vscode-table-cell className="dynamic-row-cell" key="action-row">
                      <vscode-button onClick={() => arrayHelpers.remove(index)}>
                        Remove
                      </vscode-button>
                    </vscode-table-cell>
                  </vscode-table-row>
                ))}
              </vscode-table-body>
            </vscode-table>
            <vscode-button className="dynamic-row-add-row" onClick={() => arrayHelpers.push({})}>
              Add Row
            </vscode-button>
          </>
        );
      }}
    ></FieldArray>
  );
};
