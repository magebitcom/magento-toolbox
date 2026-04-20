import { useFormikContext, getIn } from 'formik';
import { formatError } from './formatError';

export const FieldErrorMessage: React.FC<{ name: string }> = ({ name }) => {
  const form = useFormikContext<Record<string, unknown>>();
  const error = getIn(form.errors, name);
  const touched = getIn(form.touched, name);

  if (!touched || typeof error !== 'string' || error.length === 0) {
    return null;
  }

  return <>{formatError(error)}</>;
};
