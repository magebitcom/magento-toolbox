import * as php from 'php-parser';
import { PhpFile } from './PhpFile';
import { TextDocument, Uri, workspace } from 'vscode';

export enum NodeKind {
  Program = 'program',
  Namespace = 'namespace',
  Class = 'class',
  Interface = 'interface',
  UseGroup = 'usegroup',
  UseItem = 'useitem',
  Method = 'method',
}

export type KindType<K> = K extends NodeKind.Program
  ? php.Program
  : K extends NodeKind.Namespace
    ? php.Namespace
    : K extends NodeKind.Class
      ? php.Class
      : K extends NodeKind.Method
        ? php.Method
        : K extends NodeKind.UseGroup
          ? php.UseGroup
          : K extends NodeKind.UseItem
            ? php.UseItem
            : K extends NodeKind.Interface
              ? php.Interface
              : never;

export default class PhpParser {
  private parser: php.Engine;

  public constructor() {
    this.parser = new php.Engine({
      ast: {
        withPositions: true,
        extractDoc: true,
      },
    });
  }

  public async parse(uri: Uri) {
    const code = await workspace.fs.readFile(uri);
    const ast = this.parser.parseCode(code.toString(), uri.fsPath);
    return new PhpFile(ast, uri);
  }

  public async parseDocument(document: TextDocument) {
    const code = document.getText();
    const ast = this.parser.parseCode(code, document.uri.fsPath);
    return new PhpFile(ast, document.uri);
  }
}
