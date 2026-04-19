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
      return validation.errors.all();
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
