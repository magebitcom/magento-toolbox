import { SavedIndex } from 'types/indexer';

export class IndexDataSerializer {
  public serialize(data: SavedIndex): string {
    return JSON.stringify(data, this.replacer);
  }

  public deserialize(data: string): SavedIndex {
    return JSON.parse(data, this.reviver);
  }

  private replacer(key: string, value: any) {
    if (value instanceof Map) {
      return { __type: 'Map', value: Array.from(value.entries()) };
    }
    return value;
  }

  private reviver(key: string, value: any) {
    if (value && typeof value === 'object' && value.__type === 'Map') {
      return new Map(value.value);
    }
    return value;
  }
}
