import { Formik, FormikProps, FormikValues, useFormikContext } from 'formik';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { WebviewApi } from 'vscode-webview';
import Validator from 'validatorjs';
import { Command, PreviewResult, Wizard, WizardInput } from 'types/webview';
import { FieldRenderer } from './FieldRenderer';
import { PreviewList } from './PreviewList';

interface Props {
  wizard: Wizard;
  preview: PreviewResult | null;
  vscode: WebviewApi<unknown>;
}

const PREVIEW_DEBOUNCE_MS = 300;

const setIn = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const parts = path.split('.');
  let cursor: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const nextIsNumeric = /^\d+$/.test(nextKey);
    if (cursor[key] === undefined || cursor[key] === null) {
      cursor[key] = nextIsNumeric ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[parts[parts.length - 1]] = value;
};

const PreviewTrigger: React.FC<{ vscode: WebviewApi<unknown> }> = ({ vscode }) => {
  const { values } = useFormikContext<FormikValues>();

  useEffect(() => {
    const handle = setTimeout(() => {
      vscode.postMessage({ command: Command.Preview, data: values });
    }, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [values, vscode]);

  return null;
};

export const Renderer: React.FC<Props> = ({ wizard, preview, vscode }) => {
  const isSingleTab = wizard.tabs.length === 1;
  const rootRef = useRef<HTMLFormElement>(null);

  const initialValues: FormikValues = useMemo(
    () =>
      wizard.tabs.reduce((acc: FormikValues, tab) => {
        tab.fields.reduce((_: FormikValues, field) => {
          if (field.type === WizardInput.Select && field.multiple) {
            acc[field.id] = field.initialValue ?? [];
            return acc;
          }

          if (field.type === WizardInput.DynamicRow) {
            acc[field.id] = field.initialValue ?? [];
            return acc;
          }

          acc[field.id] = field.initialValue ?? '';
          return acc;
        }, {});

        return acc;
      }, {}),
    [wizard.tabs]
  );

  const handleSubmit = useCallback(
    (values: FormikValues) => {
      vscode.postMessage({ command: Command.Submit, data: values });
    },
    [vscode]
  );

  const handleCancel = useCallback(() => {
    vscode.postMessage({ command: Command.Cancel });
  }, [vscode]);

  const handleValidation = useCallback(
    (values: FormikValues) => {
      if (!wizard.validation) {
        return {};
      }

      const validation = new Validator(values, wizard.validation, wizard.validationMessages);
      validation.passes();

      // validatorjs emits errors keyed by dotted path (e.g. `sections.0.id`).
      // Formik's per-field lookup uses `getIn(errors, 'sections.0.id')`, which
      // needs the nested shape `{ sections: [{ id: '...' }] }`. Convert here so
      // DynamicRow rows light up with per-cell errors.
      const flat = validation.errors.all() as Record<string, string[]>;
      const nested: Record<string, unknown> = {};
      for (const key of Object.keys(flat)) {
        const messages = flat[key];
        const message = messages[0] ?? 'Invalid';
        setIn(nested, key, message);
      }
      return nested;
    },
    [wizard.validation, wizard.validationMessages]
  );

  useEffect(() => {
    const firstInput = rootRef.current?.querySelector<HTMLElement>(
      'vscode-textfield, vscode-single-select, vscode-multi-select, vscode-checkbox'
    );
    firstInput?.focus();
  }, []);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={handleValidation}>
      {(props: FormikProps<any>) => (
        <form
          ref={rootRef}
          className="wizard-form"
          onSubmit={event => {
            event.preventDefault();
            props.submitForm();
          }}
        >
          <PreviewTrigger vscode={vscode} />
          {isSingleTab ? (
            <div className="tab-panel">
              {wizard.tabs[0].description && (
                <p className="tab-description">{wizard.tabs[0].description}</p>
              )}
              {wizard.tabs[0].fields.map(field => (
                <FieldRenderer key={`${field.id}-field`} field={field} />
              ))}
            </div>
          ) : (
            <vscode-tabs>
              {wizard.tabs.map(tab => (
                <div key={tab.id}>
                  <vscode-tab-header slot="header">{tab.title}</vscode-tab-header>
                  <vscode-tab-panel className="tab-panel">
                    {tab.description && <p className="tab-description">{tab.description}</p>}
                    {tab.fields.map(field => (
                      <FieldRenderer key={`${field.id}-field`} field={field} />
                    ))}
                  </vscode-tab-panel>
                </div>
              ))}
            </vscode-tabs>
          )}
          <PreviewList preview={preview} />
          {props.submitCount > 0 && !props.isValid && (
            <p className="wizard-error-summary">
              Please fix the highlighted fields before generating.
            </p>
          )}
          <div className="wizard-actions">
            <vscode-button type="submit" onClick={() => props.submitForm()}>
              {wizard.submitLabel ?? 'Submit'}
            </vscode-button>
            <vscode-button secondary type="button" onClick={handleCancel}>
              Cancel
            </vscode-button>
          </div>
        </form>
      )}
    </Formik>
  );
};
