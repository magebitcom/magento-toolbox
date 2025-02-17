import { Form, Formik, FormikValues } from 'formik';
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
  const initialValues: FormikValues = wizard.fields.reduce((acc: FormikValues, field) => {
    if (field.type === WizardInput.Select && field.multiple) {
      acc[field.id] = field.initialValue ?? [];
      return acc;
    }

    acc[field.id] = field.initialValue ?? '';
    return acc;
  }, {});

  const handleSubmit = useCallback((values: FormikValues) => {
    vscode.postMessage({ command: 'submit', data: values });
  }, []);

  const handleValidation = useCallback((values: FormikValues) => {
    if (wizard.validation) {
      console.log(wizard.validation);
      const validation = new Validator(values, wizard.validation, wizard.validationMessages);

      validation.passes();

      return validation.errors.all();
    }

    return {};
  }, []);

  return (
    <main className="p-6 w-full">
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={handleValidation}>
        <Form>
          {wizard.fields.map(field => {
            return <FieldRenderer key={field.id} field={field} />;
          })}
          <div className="mt-4 flex gap-4">
            <vscode-button type="submit">Submit</vscode-button>
          </div>
        </Form>
      </Formik>
    </main>
  );
};
