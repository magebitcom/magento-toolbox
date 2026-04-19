import { useFormikContext, getIn } from 'formik';

export const FieldErrorMessage: React.FC<{ name: string }> = ({ name }) => {
  const form = useFormikContext<Record<string, unknown>>();
  const error = getIn(form.errors, name);
  const touched = getIn(form.touched, name);

  if (!touched || !error) {
    return null;
  }

  return <>{error}</>;
};
