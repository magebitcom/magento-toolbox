import { Location, Range, Uri } from 'vscode';
import IndexManager from 'indexer/IndexManager';
import LayoutIndexer from 'indexer/layout/LayoutIndexer';
import PageLayoutIndexer from 'indexer/page-layout/PageLayoutIndexer';
import FileSystem from 'util/FileSystem';
import RangeUtil from 'util/Range';
import { MagentoScope } from 'types/global';
import { handleOfLayout, isAreaInScope } from 'indexer/layout/LayoutIndexData';
import { LayoutSymbol } from './LayoutSymbol';

type FileSource = { path: string; source: 'layout' | 'page_layout' };

export default class LayoutScanner {
  public static async findReferences(
    symbol: LayoutSymbol,
    area: MagentoScope
  ): Promise<Location[]> {
    const files = this.collectFiles(area);
    const patterns = this.buildPatterns(symbol);

    const locations: Location[] = [];

    for (const file of files) {
      if (symbol.kind === 'handle' && file.source !== 'layout') {
        continue;
      }

      const uri = Uri.file(file.path);

      if (symbol.kind === 'handle' && handleOfLayout({ path: file.path }) === symbol.name) {
        locations.push(new Location(uri, new Range(0, 0, 0, 0)));
      }

      const content = await FileSystem.readFile(uri);
      for (const pattern of patterns) {
        for (const range of RangeUtil.fileRegexToVsCodeRanges(pattern, content)) {
          locations.push(new Location(uri, range));
        }
      }
    }

    return locations;
  }

  private static collectFiles(area: MagentoScope): FileSource[] {
    const files: FileSource[] = [];

    const layoutIndexData = IndexManager.getIndexData(LayoutIndexer.KEY);
    if (layoutIndexData) {
      for (const layout of layoutIndexData.getLayouts()) {
        if (isAreaInScope(layout.area, area)) {
          files.push({ path: layout.path, source: 'layout' });
        }
      }
    }

    const pageLayoutIndexData = IndexManager.getIndexData(PageLayoutIndexer.KEY);
    if (pageLayoutIndexData) {
      for (const pageLayout of pageLayoutIndexData.getPageLayouts()) {
        if (isAreaInScope(pageLayout.area, area)) {
          files.push({ path: pageLayout.path, source: 'page_layout' });
        }
      }
    }

    return files;
  }

  private static buildPatterns(symbol: LayoutSymbol): RegExp[] {
    const escaped = this.escape(symbol.name);

    if (symbol.kind === 'block-name') {
      return [
        new RegExp(`<(?:block|referenceBlock)\\b[^>]*\\bname="(${escaped})"`, 'g'),
        new RegExp(`<move\\b[^>]*\\belement="(${escaped})"`, 'g'),
      ];
    }

    if (symbol.kind === 'container-name') {
      return [
        new RegExp(`<(?:container|referenceContainer)\\b[^>]*\\bname="(${escaped})"`, 'g'),
        new RegExp(`<move\\b[^>]*\\bdestination="(${escaped})"`, 'g'),
        new RegExp(`<move\\b[^>]*\\belement="(${escaped})"`, 'g'),
      ];
    }

    if (symbol.kind === 'handle') {
      return [new RegExp(`<update\\b[^>]*\\bhandle="(${escaped})"`, 'g')];
    }

    return [];
  }

  private static escape(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
