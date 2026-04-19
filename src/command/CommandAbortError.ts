/**
 * Thrown from inside a command's showWizard() to cleanly abort before any files
 * are generated. The base command swallows it silently — callers should show
 * their own error message before throwing.
 */
export default class CommandAbortError extends Error {
  constructor(message?: string) {
    super(message ?? 'Command aborted');
    this.name = 'CommandAbortError';
  }
}
