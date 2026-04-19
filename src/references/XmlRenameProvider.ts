import { minimatch } from 'minimatch';
import {
  CancellationToken,
  Position,
  Range,
  RenameProvider,
  TextDocument,
  WorkspaceEdit,
} from 'vscode';
import Magento from 'util/Magento';
import LayoutSymbolDetector from './LayoutSymbol';
import LayoutScanner from './LayoutScanner';

const LAYOUT_PATTERNS = ['**/layout/*.xml', '**/page_layout/*.xml'];

export default class XmlRenameProvider implements RenameProvider {
  public async prepareRename(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
  ): Promise<Range | { range: Range; placeholder: string }> {
    if (!this.isLayoutFile(document.uri.fsPath)) {
      throw new Error('Rename is only supported in layout/page_layout XML files.');
    }

    const symbol = await LayoutSymbolDetector.detect(document, position);
    if (!symbol) {
      throw new Error('Not a renameable layout symbol.');
    }

    if (symbol.kind === 'handle') {
      throw new Error('Renaming layout handles is not supported.');
    }

    return { range: symbol.range, placeholder: symbol.name };
  }

  public async provideRenameEdits(
    document: TextDocument,
    position: Position,
    newName: string,
    _token: CancellationToken
  ): Promise<WorkspaceEdit> {
    const edit = new WorkspaceEdit();

    if (!this.isLayoutFile(document.uri.fsPath)) {
      return edit;
    }

    const symbol = await LayoutSymbolDetector.detect(document, position);
    if (!symbol || symbol.kind === 'handle') {
      return edit;
    }

    const area = Magento.getLayoutArea(document.uri.fsPath);
    const locations = await LayoutScanner.findReferences(symbol, area);

    for (const location of locations) {
      edit.replace(location.uri, location.range, newName);
    }

    return edit;
  }

  private isLayoutFile(filePath: string): boolean {
    return LAYOUT_PATTERNS.some(pattern => minimatch(filePath, pattern, { matchBase: true }));
  }
}
