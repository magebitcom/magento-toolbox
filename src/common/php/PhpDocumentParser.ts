import DocumentCache from 'cache/DocumentCache';
import PhpParser from 'parser/php/Parser';
import { PhpFile } from 'parser/php/PhpFile';
import { TextDocument, Uri } from 'vscode';

class PhpDocumentParser {
  protected readonly parser: PhpParser;

  constructor() {
    this.parser = new PhpParser();
  }

  public async parse(document: TextDocument): Promise<PhpFile> {
    const cacheKey = `php-file`;

    if (DocumentCache.has(document, cacheKey)) {
      return DocumentCache.get(document, cacheKey);
    }

    const phpParser = new PhpParser();
    const phpFile = await phpParser.parseDocument(document);
    DocumentCache.set(document, cacheKey, phpFile);
    return phpFile;
  }

  public async parseUri(document: TextDocument, uri: Uri): Promise<PhpFile> {
    const cacheKey = `php-file-${uri.fsPath}`;

    if (DocumentCache.has(document, cacheKey)) {
      return DocumentCache.get(document, cacheKey);
    }

    const phpParser = new PhpParser();
    const phpFile = await phpParser.parse(uri);
    DocumentCache.set(document, cacheKey, phpFile);
    return phpFile;
  }
}

export default new PhpDocumentParser();
