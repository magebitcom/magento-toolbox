/**
 * Compress the default validatorjs messages into short, human labels that
 * fit inside narrow DynamicRow columns without wrapping to many lines.
 */
export function formatError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes(' required')) {
    return 'Required';
  }
  if (lower.includes('format is invalid') || lower.includes('is invalid')) {
    return 'Invalid format';
  }
  if (lower.includes('must be a valid email')) {
    return 'Invalid email';
  }
  if (lower.includes('must be a number')) {
    return 'Must be a number';
  }
  return message;
}
