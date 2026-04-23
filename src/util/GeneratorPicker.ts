import * as vscode from 'vscode';
import ExtensionState from 'common/ExtensionState';

export interface GeneratorEntry {
  id: string;
  title: string;
  category: string;
}

const EXCLUDED_COMMAND_IDS = new Set<string>([
  'magento-toolbox.generate',
  'magento-toolbox.generateXmlCatalog',
]);

/**
 * Collects every `magento-toolbox.generate*` command declared in package.json
 * so the switcher and the top-level picker don't need a hand-maintained list.
 */
export function listGenerators(): GeneratorEntry[] {
  const pkg = ExtensionState.context.extension.packageJSON as {
    contributes?: {
      commands?: Array<{ command: string; title: string; category?: string }>;
    };
  };
  const commands = pkg.contributes?.commands ?? [];
  return commands
    .filter(c => c.command.startsWith('magento-toolbox.generate'))
    .filter(c => !EXCLUDED_COMMAND_IDS.has(c.command))
    .map(c => ({ id: c.command, title: c.title, category: c.category ?? '' }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Shows a native VS Code QuickPick listing every generator. Returns the
 * command id of the user's choice, or undefined if they dismissed the picker.
 */
export async function pickGenerator(): Promise<string | undefined> {
  const entries = listGenerators();
  const items = entries.map(entry => ({
    label: entry.title.replace(/^Generate\s+/i, ''),
    description: entry.id,
    id: entry.id,
  }));
  const picked = await vscode.window.showQuickPick(items, {
    title: 'Magento Toolbox: pick a generator',
    placeHolder: 'Type to filter generators…',
    matchOnDescription: true,
  });
  return picked?.id;
}
