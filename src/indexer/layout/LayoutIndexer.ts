import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import { Layout } from './types';
import { XMLParser } from 'fast-xml-parser';
import FileSystem from 'util/FileSystem';
import IndexManager from 'indexer/IndexManager';
import ThemeIndexer from 'indexer/theme/ThemeIndexer';
import { Theme } from 'indexer/theme/types';

export default class LayoutIndexer extends Indexer<Layout> {
  public static readonly KEY = 'layout';

  private xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: () => {
        return true;
      },
    });
  }

  public getVersion(): number {
    return 1;
  }

  public getId(): IndexerKey {
    return LayoutIndexer.KEY;
  }

  public getName(): string {
    return 'layout';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/layout/*.xml');
  }

  public async indexFile(uri: Uri): Promise<Layout | undefined> {
    const xml = await FileSystem.readFile(uri);
    const parsed = this.xmlParser.parse(xml);

    const pageNode = Array.isArray(parsed?.page) ? parsed.page[0] : undefined;

    if (!pageNode) {
      return undefined;
    }

    const getAttr = (node: any, name: string): string | undefined => {
      const value = node?.[`@_${name}`];
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    };

    const getBoolAttr = (node: any, name: string): boolean | undefined => {
      const raw = getAttr(node, name);
      if (raw === undefined) {
        return undefined;
      }
      const lowered = String(raw).toLowerCase();
      if (lowered === 'true' || lowered === '1') {
        return true;
      }
      if (lowered === 'false' || lowered === '0') {
        return false;
      }
      return undefined;
    };

    const getNumAttr = (node: any, name: string): number | undefined => {
      const raw = getAttr(node, name);
      if (raw === undefined) {
        return undefined;
      }
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };

    const mapUiComponents = (nodes: any[] | undefined) => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        name: getAttr(node, 'name'),
        component: getAttr(node, 'component'),
        as: getAttr(node, 'as'),
        ttl: getNumAttr(node, 'ttl'),
        group: getAttr(node, 'group'),
        acl: getAttr(node, 'acl'),
        cacheable: getBoolAttr(node, 'cacheable'),
      }));
    };

    const mapBlocks = (nodes: any[] | undefined): any[] => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        name: getAttr(node, 'name'),
        class: getAttr(node, 'class'),
        cacheable: getBoolAttr(node, 'cacheable'),
        as: getAttr(node, 'as'),
        ttl: getNumAttr(node, 'ttl'),
        group: getAttr(node, 'group'),
        acl: getAttr(node, 'acl'),
        block: mapBlocks(node.block),
        container: mapContainers(node.container),
        referenceBlock: mapReferenceBlocks(node.referenceBlock),
        uiComponent: mapUiComponents(node.uiComponent),
      }));
    };

    const mapReferenceBlocks = (nodes: any[] | undefined): any[] => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        name: getAttr(node, 'name') as string,
        template: getAttr(node, 'template'),
        class: getAttr(node, 'class'),
        group: getAttr(node, 'group'),
        display: getBoolAttr(node, 'display'),
        remove: getBoolAttr(node, 'remove'),
        block: mapBlocks(node.block),
        referenceBlock: mapReferenceBlocks(node.referenceBlock),
        uiComponent: mapUiComponents(node.uiComponent),
        container: mapContainers(node.container),
      }));
    };

    const mapContainers = (nodes: any[] | undefined): any[] => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        name: getAttr(node, 'name') as string,
        after: getAttr(node, 'after'),
        before: getAttr(node, 'before'),
        block: mapBlocks(node.block),
        referenceBlock: mapReferenceBlocks(node.referenceBlock),
        uiComponent: mapUiComponents(node.uiComponent),
        container: mapContainers(node.container),
      }));
    };

    const mapMoves = (nodes: any[] | undefined) => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        element: getAttr(node, 'element') as string,
        destination: getAttr(node, 'destination') as string,
        as: getAttr(node, 'as'),
        after: getAttr(node, 'after'),
        before: getAttr(node, 'before'),
      }));
    };

    const bodyNode = Array.isArray(pageNode.body) ? pageNode.body[0] : undefined;
    const body = bodyNode
      ? {
          block: mapBlocks(bodyNode.block),
          referenceBlock: mapReferenceBlocks(bodyNode.referenceBlock),
          uiComponent: mapUiComponents(bodyNode.uiComponent),
          container: mapContainers(bodyNode.container),
          move: mapMoves(bodyNode.move),
        }
      : { block: [], referenceBlock: [], uiComponent: [], container: [], move: [] };

    const page = {
      update: Array.isArray(pageNode.update)
        ? pageNode.update.map((u: any) => ({
            handle: getAttr(u, 'handle') as string,
          }))
        : [],
      body: [body],
    };

    const path = uri.fsPath;
    const p = path.replace(/\\/g, '/');

    let area = 'base';
    if (p.includes('/view/frontend/layout/') || p.includes('/app/design/frontend/')) {
      area = 'frontend';
    } else if (p.includes('/view/adminhtml/layout/') || p.includes('/app/design/adminhtml/')) {
      area = 'adminhtml';
    } else if (p.includes('/view/base/layout/') || p.includes('/app/design/base/')) {
      area = 'base';
    }

    const theme = this.getTheme(path);

    const layout: Layout = {
      area,
      theme: theme?.title ?? '-',
      path,
      page,
    };

    return layout;
  }

  private getTheme(path: string): Theme | undefined {
    const themeIndexData = IndexManager.getIndexData(ThemeIndexer.KEY);

    return themeIndexData?.getThemeByFilePath(path);
  }
}
