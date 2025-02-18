import { Form, Formik, FormikProps, FormikValues } from 'formik';
import { useCallback } from 'react';
import { WebviewApi } from 'vscode-webview';
import Validator from 'validatorjs';
import { Wizard, WizardInput } from 'webview/types';
import { FieldRenderer } from './FieldRenderer';

interface Props {
  wizard: Wizard;
  vscode: WebviewApi<unknown>;
}

export const Renderer: React.FC<Props> = ({ wizard, vscode }) => {
  const initialValues: FormikValues = wizard.tabs.reduce((acc: FormikValues, tab) => {
    tab.fields.reduce((acc: FormikValues, field) => {
      if (field.type === WizardInput.Select && field.multiple) {
        acc[field.id] = field.initialValue ?? [];
        return acc;
      }

      acc[field.id] = field.initialValue ?? '';
      return acc;
    }, {});

    return acc;
  }, {});

  const handleSubmit = useCallback((values: FormikValues) => {
    vscode.postMessage({ command: 'submit', data: values });
  }, []);

  const handleValidation = useCallback((values: FormikValues) => {
    if (wizard.validation) {
      const validation = new Validator(values, wizard.validation, wizard.validationMessages);

      validation.passes();

      return validation.errors.all();
    }

    return {};
  }, []);

  return (
    <main>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={handleValidation}>
        {(props: FormikProps<any>) => {
          return (
            <>
              <vscode-tabs>
                {wizard.tabs.map(tab => {
                  return (
                    <>
                      <vscode-tab-header slot="header">{tab.title}</vscode-tab-header>
                      <vscode-tab-panel>
                        <p>{tab.description}</p>
                        <br />
                        {tab.fields.map(field => {
                          return <FieldRenderer key={field.id} field={field} />;
                        })}
                      </vscode-tab-panel>
                    </>
                  );
                })}
              </vscode-tabs>
              <br />
              <vscode-button disabled={!props.dirty || !props.isValid} type="submit">
                Submit
              </vscode-button>
            </>
          );
        }}
      </Formik>
    </main>
  );
};
