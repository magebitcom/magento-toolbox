import { Memoize } from 'typescript-memoize';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import { PageLayout } from './types';
import PageLayoutIndexer from './PageLayoutIndexer';
import { Block, Container } from 'indexer/layout/types';
import { collectAll, findByName } from 'indexer/layout/walker';
import { handleOfLayout, isAreaInScope } from 'indexer/layout/LayoutIndexData';
import { MagentoScope } from 'types/global';

export type WithPageLayout<T> = {
  pageLayout: PageLayout;
  element: T;
};

export class PageLayoutIndexData extends AbstractIndexData<PageLayout> {
  @Memoize({
    tags: [PageLayoutIndexer.KEY],
  })
  public getPageLayouts(): PageLayout[] {
    return Array.from(this.data.values()).flat();
  }

  @Memoize({
    tags: [PageLayoutIndexer.KEY],
    hashFunction: (name: string, area: MagentoScope) => `${area}:${name}`,
  })
  public getBlocksByName(name: string, area: MagentoScope): WithPageLayout<Block>[] {
    const result: WithPageLayout<Block>[] = [];

    for (const pageLayout of this.getPageLayouts()) {
      if (!isAreaInScope(pageLayout.area, area)) {
        continue;
      }

      const values = findByName<Block, PageLayout>('block', name, pageLayout, pageLayout);
      for (const { parent, element } of values) {
        result.push({ pageLayout: parent, element });
      }
    }

    return result;
  }

  @Memoize({
    tags: [PageLayoutIndexer.KEY],
    hashFunction: (name: string, area: MagentoScope) => `${area}:${name}`,
  })
  public getContainersByName(name: string, area: MagentoScope): WithPageLayout<Container>[] {
    const result: WithPageLayout<Container>[] = [];

    for (const pageLayout of this.getPageLayouts()) {
      if (!isAreaInScope(pageLayout.area, area)) {
        continue;
      }

      const values = findByName<Container, PageLayout>('container', name, pageLayout, pageLayout);
      for (const { parent, element } of values) {
        result.push({ pageLayout: parent, element });
      }
    }

    return result;
  }

  @Memoize({
    tags: [PageLayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getHandles(area: MagentoScope): string[] {
    const handles = new Set<string>();

    for (const pageLayout of this.getPageLayouts()) {
      if (!isAreaInScope(pageLayout.area, area)) {
        continue;
      }
      handles.add(handleOfLayout(pageLayout));
    }

    return Array.from(handles);
  }

  @Memoize({
    tags: [PageLayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getAllBlockNames(area: MagentoScope): string[] {
    const names = new Set<string>();

    for (const pageLayout of this.getPageLayouts()) {
      if (!isAreaInScope(pageLayout.area, area)) {
        continue;
      }

      const values = collectAll<Block, PageLayout>('block', pageLayout, pageLayout);
      for (const { element } of values) {
        if (element.name) {
          names.add(element.name);
        }
      }
    }

    return Array.from(names);
  }

  @Memoize({
    tags: [PageLayoutIndexer.KEY],
    hashFunction: (area: MagentoScope) => area,
  })
  public getAllContainerNames(area: MagentoScope): string[] {
    const names = new Set<string>();

    for (const pageLayout of this.getPageLayouts()) {
      if (!isAreaInScope(pageLayout.area, area)) {
        continue;
      }

      const values = collectAll<Container, PageLayout>('container', pageLayout, pageLayout);
      for (const { element } of values) {
        if (element.name) {
          names.add(element.name);
        }
      }
    }

    return Array.from(names);
  }
}
