import { RelativePattern, Uri } from 'vscode';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import { PageLayout } from './types';
import { XMLParser } from 'fast-xml-parser';
import FileSystem from 'util/FileSystem';

export default class PageLayoutIndexer extends Indexer<PageLayout> {
  public static readonly KEY = 'page-layout';

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
    return PageLayoutIndexer.KEY;
  }

  public getName(): string {
    return 'page-layout';
  }

  public getPattern(uri: Uri): RelativePattern {
    return new RelativePattern(uri, '**/page_layout/*.xml');
  }

  public async indexFile(uri: Uri): Promise<PageLayout | undefined> {
    const xml = await FileSystem.readFile(uri);
    const parsed = this.xmlParser.parse(xml);

    const layoutNode = Array.isArray(parsed?.layout) ? parsed.layout[0] : undefined;

    if (!layoutNode) {
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
        referenceContainer: mapReferenceContainers(node.referenceContainer),
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
        referenceContainer: mapReferenceContainers(node.referenceContainer),
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
        referenceContainer: mapReferenceContainers(node.referenceContainer),
      }));
    };

    const mapReferenceContainers = (nodes: any[] | undefined): any[] => {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => ({
        name: getAttr(node, 'name') as string,
        remove: getBoolAttr(node, 'remove'),
        display: getBoolAttr(node, 'display'),
        block: mapBlocks(node.block),
        referenceBlock: mapReferenceBlocks(node.referenceBlock),
        uiComponent: mapUiComponents(node.uiComponent),
        container: mapContainers(node.container),
        referenceContainer: mapReferenceContainers(node.referenceContainer),
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

    const pageLayout: PageLayout = {
      path: uri.fsPath,
      block: mapBlocks(layoutNode.block),
      referenceBlock: mapReferenceBlocks(layoutNode.referenceBlock),
      uiComponent: mapUiComponents(layoutNode.uiComponent),
      container: mapContainers(layoutNode.container),
      referenceContainer: mapReferenceContainers(layoutNode.referenceContainer),
      move: mapMoves(layoutNode.move),
    };

    return pageLayout;
  }
}
