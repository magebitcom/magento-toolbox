import { Disposable, Uri, workspace } from 'vscode';
import path from 'path';
import { defineIndexer, IndexerWatcherContext } from 'indexer/IndexerDefinition';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import { AutoloadNamespaceIndexData } from './AutoloadNamespaceIndexData';
import { Namespace } from './types';
import Logger from 'util/Logger';

export default defineIndexer({
  key: AutoloadNamespaceIndexer.KEY,
  createIndexer: () => new AutoloadNamespaceIndexer(),
  createData: raw => new AutoloadNamespaceIndexData(raw),
  watchAdditional: (context: IndexerWatcherContext<Namespace[]>) => {
    const watcher = workspace.createFileSystemWatcher(
      '**/*.php',
      false, // ignoreCreateEvents
      true, // ignoreChangeEvents — content changes don't affect FQN
      false // ignoreDeleteEvents
    );

    const disposables: Disposable[] = [watcher];

    disposables.push(
      watcher.onDidCreate(async file => {
        await mutate(context, data => addFile(data, file));
        Logger.logWithTime('Autoload: PHP file created', file.fsPath);
      })
    );

    disposables.push(
      watcher.onDidDelete(async file => {
        await mutate(context, data => removeFile(data, file));
        Logger.logWithTime('Autoload: PHP file deleted', file.fsPath);
      })
    );

    return disposables;
  },
});

async function mutate(
  context: IndexerWatcherContext<Namespace[]>,
  fn: (data: Map<string, Namespace[]>) => boolean
): Promise<void> {
  const data = context.getData();
  const changed = fn(data);
  if (changed) {
    await context.commit(data);
  }
}

function addFile(data: Map<string, Namespace[]>, file: Uri): boolean {
  if (!isClassFile(file.fsPath)) {
    return false;
  }

  const match = findOwningNamespace(data, file.fsPath);
  if (!match) {
    return false;
  }

  const { composerPath, baseDirectory, prefix } = match;
  const list = data.get(composerPath) ?? [];

  if (list.some(n => n.path === file.fsPath)) {
    return false;
  }

  const fqn = computeFqn(prefix, baseDirectory, file.fsPath);
  list.push({
    fqn,
    prefix,
    baseDirectory,
    path: file.fsPath,
  });
  data.set(composerPath, list);
  return true;
}

function removeFile(data: Map<string, Namespace[]>, file: Uri): boolean {
  let changed = false;
  for (const [composerPath, list] of data.entries()) {
    const filtered = list.filter(n => n.path !== file.fsPath);
    if (filtered.length !== list.length) {
      data.set(composerPath, filtered);
      changed = true;
    }
  }
  return changed;
}

function isClassFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  return basename.endsWith('.php') && basename.charAt(0) === basename.charAt(0).toUpperCase();
}

type OwningNamespace = {
  composerPath: string;
  baseDirectory: string;
  prefix: string;
};

function findOwningNamespace(
  data: Map<string, Namespace[]>,
  filePath: string
): OwningNamespace | undefined {
  const normalizedFile = normalize(filePath);
  let best: OwningNamespace | undefined;

  for (const [composerPath, list] of data.entries()) {
    const seen = new Set<string>();
    for (const entry of list) {
      const key = `${entry.baseDirectory}\0${entry.prefix}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const normalizedBase = normalize(entry.baseDirectory);
      if (!normalizedFile.startsWith(normalizedBase + '/')) {
        continue;
      }

      if (!best || normalizedBase.length > normalize(best.baseDirectory).length) {
        best = {
          composerPath,
          baseDirectory: entry.baseDirectory,
          prefix: entry.prefix,
        };
      }
    }
  }

  return best;
}

function computeFqn(prefix: string, baseDirectory: string, filePath: string): string {
  const relative = path.relative(baseDirectory, filePath).replace(/\\/g, '/');
  const noExt = relative.replace(/\.php$/, '');
  const normalizedPrefix = prefix.replace(/\\$/, '').replace(/^\\/, '');
  return `${normalizedPrefix}\\${noExt.replace(/\//g, '\\')}`;
}

function normalize(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/$/, '');
}
