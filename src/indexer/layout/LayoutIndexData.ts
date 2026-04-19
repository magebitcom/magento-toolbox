import { Memoize } from 'typescript-memoize';
import { Block, Container, Layout, WithLayout } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import LayoutIndexer from './LayoutIndexer';
import { MagentoScope } from 'types/global';

export class LayoutIndexData extends AbstractIndexData<Layout> {
  @Memoize({
    tags: [LayoutIndexer.KEY],
  })
  public getLayouts(): Layout[] {
    return Array.from(this.data.values()).flat();
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (name: string) => name,
  })
  public getBlocksByName(
    name: string,
    area: MagentoScope = MagentoScope.Frontend
  ): WithLayout<Block>[] {
    const result: WithLayout<Block>[] = [];

    for (const layout of this.getLayouts()) {
      if (layout.area !== area) {
        continue;
      }

      const values = this.findByName<Block>('block', name, layout, layout.page.body);
      result.push(...values);
    }

    return result;
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (name: string) => name,
  })
  public getContainersByName(
    name: string,
    area: MagentoScope = MagentoScope.Frontend
  ): WithLayout<Container>[] {
    const result: WithLayout<Container>[] = [];

    for (const layout of this.getLayouts()) {
      if (layout.area !== area) {
        continue;
      }

      const values = this.findByName<Container>('container', name, layout, layout.page.body);
      result.push(...values);
    }

    return result;
  }

  private findByName<T>(
    key: string,
    name: string,
    layout: Layout,
    parent: unknown
  ): WithLayout<T>[] {
    const result: WithLayout<T>[] = [];

    const innerWalk = (layout: Layout, node: unknown) => {
      if (Array.isArray(node)) {
        for (const item of node) {
          innerWalk(layout, item as any);
        }
        return;
      }

      if (node && typeof node === 'object') {
        const obj = node as Record<string, unknown>;

        if (Array.isArray((obj as any)[key])) {
          const elements = (obj as any)[key] as T[];

          for (const element of elements) {
            if (element && (element as any).name === name) {
              result.push({ layout, element: element });
            }

            innerWalk(layout, element as any);
          }
        }

        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (value && typeof value === 'object') {
            innerWalk(layout, value as any);
          }
        }
      }
    };

    innerWalk(layout, parent);

    return result;
  }
}
