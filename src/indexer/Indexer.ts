import { type GlobPattern, type Uri } from 'vscode';

export abstract class Indexer<D = any> {
  public abstract getId(): string;
  public abstract getName(): string;
  public abstract getPattern(uri: Uri): GlobPattern;
  public abstract indexFile(uri: Uri): Promise<D | undefined>;
}
