import { Memoize } from 'typescript-memoize';
import { Block, Container, Layout, WithLayout } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import LayoutIndexer from './LayoutIndexer';
import { MagentoScope } from 'types/global';
import { collectAll, findByName } from './walker';

export class LayoutIndexData extends AbstractIndexData<Layout> {
  @Memoize({
    tags: [LayoutIndexer.KEY],
  })
  public getLayouts(): Layout[] {
    return Array.from(this.data.values()).flat();
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (name: string, area: MagentoScope) => `${area}:${name}`,
  })
  public getBlocksByName(name: string, area: MagentoScope): WithLayout<Block>[] {
    const result: WithLayout<Block>[] = [];

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }

      const values = findByName<Block, Layout>('block', name, layout, layout.page.body);
      for (const { parent, element } of values) {
        result.push({ layout: parent, element });
      }
    }

    return result;
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (name: string, area: MagentoScope) => `${area}:${name}`,
  })
  public getContainersByName(name: string, area: MagentoScope): WithLayout<Container>[] {
    const result: WithLayout<Container>[] = [];

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }

      const values = findByName<Container, Layout>('container', name, layout, layout.page.body);
      for (const { parent, element } of values) {
        result.push({ layout: parent, element });
      }
    }

    return result;
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (handle: string, area: MagentoScope) => `${area}:${handle}`,
  })
  public getLayoutsByHandle(handle: string, area: MagentoScope): Layout[] {
    const result: Layout[] = [];

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }

      if (handleOfLayout(layout) === handle) {
        result.push(layout);
      }
    }

    return result;
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getHandles(area: MagentoScope): string[] {
    const handles = new Set<string>();

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }
      handles.add(handleOfLayout(layout));
    }

    return Array.from(handles);
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getAllBlockNames(area: MagentoScope): string[] {
    const names = new Set<string>();

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }

      const values = collectAll<Block, Layout>('block', layout, layout.page.body);
      for (const { element } of values) {
        if (element.name) {
          names.add(element.name);
        }
      }
    }

    return Array.from(names);
  }

  @Memoize({
    tags: [LayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getAllContainerNames(area: MagentoScope): string[] {
    const names = new Set<string>();

    for (const layout of this.getLayouts()) {
      if (!isAreaInScope(layout.area, area)) {
        continue;
      }

      const values = collectAll<Container, Layout>('container', layout, layout.page.body);
      for (const { element } of values) {
        if (element.name) {
          names.add(element.name);
        }
      }
    }

    return Array.from(names);
  }
}

export function isAreaInScope(layoutArea: MagentoScope, requestedArea: MagentoScope): boolean {
  if (requestedArea === MagentoScope.Base) {
    return true;
  }
  return layoutArea === requestedArea || layoutArea === MagentoScope.Base;
}

export function handleOfLayout(layout: { path: string }): string {
  const segments = layout.path.replace(/\\/g, '/').split('/');
  const filename = segments[segments.length - 1] ?? '';
  return filename.replace(/\.xml$/, '');
}
