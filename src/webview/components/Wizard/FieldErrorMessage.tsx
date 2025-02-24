import { Field, FormikProps, getIn } from 'formik';

export const FieldErrorMessage: React.FC<{ name: string }> = ({ name }) => {
  return (
    <Field
      name={name}
      render={({ form }: { form: FormikProps<any> }) => {
        const error = form.errors[name];
        const touch = getIn(form.touched, name);

        return touch && error ? error : null;
      }}
    />
  );
};
