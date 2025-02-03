import PhpNamespace from 'common/PhpNamespace';
import { TextDocument, Range } from 'vscode';

export class PhpFileInfo {
  public readonly isClass: boolean;
  public readonly isInterface: boolean;
  public readonly namespace: PhpNamespace | undefined;
  public readonly name: PhpNamespace | undefined;
  public readonly nameRange: Range | undefined;

  constructor(private readonly textDocument: TextDocument) {
    const sourceCode = this.textDocument.getText();
    const namespaceRegex = /namespace\s([^;]+)/;
    const classRegex = /(class)\s(\w+)/;
    const interfaceRegex = /(interface)\s(\w+)/;
    const namespaceMatch = sourceCode.match(namespaceRegex);
    const classMatch = sourceCode.match(classRegex);
    const interfaceMatch = sourceCode.match(interfaceRegex);

    this.isClass = classMatch !== null;
    this.isInterface = interfaceMatch !== null;

    if (namespaceMatch !== null) {
      this.namespace = PhpNamespace.fromString(namespaceMatch[1]);
    }

    if (classMatch !== null) {
      this.name = this.namespace?.append(classMatch[2]);
    } else if (interfaceMatch !== null) {
      this.name = this.namespace?.append(interfaceMatch[2]);
    }

    const nameOffset = classMatch?.index ?? interfaceMatch?.index ?? 0;

    if (nameOffset !== undefined) {
      const nameLength = classMatch?.[2]?.length ?? interfaceMatch?.[2]?.length ?? 0;
      const typeOffset = this.isClass ? 5 : 9;

      this.nameRange = new Range(
        this.textDocument.positionAt(nameOffset + typeOffset + 1),
        this.textDocument.positionAt(nameOffset + nameLength + typeOffset + 1)
      );
    }
  }
}
