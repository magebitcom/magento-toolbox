import { minimatch } from 'minimatch';
import {
  CancellationToken,
  Location,
  Position,
  ReferenceContext,
  ReferenceProvider,
  TextDocument,
} from 'vscode';
import Magento from 'util/Magento';
import LayoutSymbolDetector from './LayoutSymbol';
import LayoutScanner from './LayoutScanner';

const LAYOUT_PATTERNS = ['**/layout/*.xml', '**/page_layout/*.xml'];

export default class XmlReferenceProvider implements ReferenceProvider {
  public async provideReferences(
    document: TextDocument,
    position: Position,
    _context: ReferenceContext,
    _token: CancellationToken
  ): Promise<Location[]> {
    if (!this.isLayoutFile(document.uri.fsPath)) {
      return [];
    }

    const symbol = await LayoutSymbolDetector.detect(document, position);
    if (!symbol) {
      return [];
    }

    const area = Magento.getLayoutArea(document.uri.fsPath);
    return LayoutScanner.findReferences(symbol, area);
  }

  private isLayoutFile(filePath: string): boolean {
    return LAYOUT_PATTERNS.some(pattern => minimatch(filePath, pattern, { matchBase: true }));
  }
}
