import { Memoize } from 'typescript-memoize';

export abstract class IndexData<T = any> {
  public constructor(protected data: Map<string, T>) {}

  @Memoize()
  public getValues(): T[] {
    return Array.from(this.data.values());
  }
}
