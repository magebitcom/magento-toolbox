import { IndexerKey } from 'types/indexer';

export abstract class Indexer<D = any> {
  public abstract getId(): IndexerKey;
  public abstract getName(): string;
  public abstract getPattern(): string;

  public getExcludePattern(): string | null {
    return null;
  }

  public abstract indexFile(path: string): Promise<D | undefined>;
  public abstract getVersion(): number;
}
