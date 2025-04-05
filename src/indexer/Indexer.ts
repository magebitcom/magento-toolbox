import { type GlobPattern, type Uri } from 'vscode';
import { IndexerKey } from 'types/indexer';

export abstract class Indexer<D = any> {
  public abstract getId(): IndexerKey;
  public abstract getName(): string;
  public abstract getPattern(uri: Uri): GlobPattern;
  public abstract indexFile(uri: Uri): Promise<D | undefined>;
  public abstract getVersion(): number;
}
