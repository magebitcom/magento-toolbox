import { DocumentCstNode, parse } from '@xml-tools/parser';
import DocumentCache from 'cache/DocumentCache';
import PhpParser from 'parser/php/Parser';
import { TextDocument } from 'vscode';
import { buildAst, XMLDocument } from '@xml-tools/ast';

export interface TokenData {
  cst: DocumentCstNode;
  // xml-tools parser doesnt have an exported type for this
  tokenVector: any[];
  ast: XMLDocument;
}

class XmlDocumentParser {
  protected readonly parser: PhpParser;

  constructor() {
    this.parser = new PhpParser();
  }

  public async parse(document: TextDocument, skipCache = false): Promise<TokenData> {
    const cacheKey = `xml-file`;

    if (!skipCache && DocumentCache.has(document, cacheKey)) {
      return DocumentCache.get(document, cacheKey);
    }

    const { cst, tokenVector } = parse(document.getText());
    const ast = buildAst(cst as DocumentCstNode, tokenVector);
    const tokenData: TokenData = { cst: cst as DocumentCstNode, tokenVector, ast };

    if (!skipCache) {
      DocumentCache.set(document, cacheKey, tokenData);
    }

    return tokenData;
  }
}

export default new XmlDocumentParser();
