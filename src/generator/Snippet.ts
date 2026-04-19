import FileGenerator from './FileGenerator';

/**
 * A Snippet is a composable unit of code generation. It takes wizard data
 * (and optional shared context) and returns one or more FileGenerators.
 *
 * Most Mage2Gen-style features (CRUD entities, admin grids, system config)
 * produce many files across PHP and XML. Composing snippets lets commands
 * declare the set of generators without hand-wiring each one.
 */
export interface Snippet<TData, TContext = void> {
  readonly id: string;

  buildGenerators(data: TData, context: TContext): FileGenerator[];
}

/**
 * Flatten a list of snippets into the combined list of generators they
 * produce for the given data (and optional shared context).
 */
export function composeSnippets<TData, TContext = void>(
  snippets: Snippet<TData, TContext>[],
  data: TData,
  context: TContext = undefined as TContext
): FileGenerator[] {
  return snippets.flatMap(snippet => snippet.buildGenerators(data, context));
}
