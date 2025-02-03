import { workspace, type GlobPattern, type Uri } from 'vscode';

declare global {
  interface IndexerData {}
}

export abstract class Indexer {
  public abstract getId(): keyof IndexerData;
  public abstract getName(): string;
  public abstract getPattern(uri: Uri): GlobPattern;
  public abstract indexFile(uri: Uri): Promise<void>;
  public abstract getData(): any;
  public abstract clear(): void;

  public async readFile(uri: Uri): Promise<string> {
    const data = await workspace.fs.readFile(uri);

    return data.toString();
  }
}
