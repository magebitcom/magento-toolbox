import { trimStart } from 'lodash-es';

export default class PhpNamespace {
  private static readonly NS_SEPARATOR = '\\';

  public constructor(private parts: string[]) {}

  public static fromString(ns: string): PhpNamespace {
    return new PhpNamespace(
      trimStart(ns, PhpNamespace.NS_SEPARATOR)
        .split(PhpNamespace.NS_SEPARATOR)
        .filter(part => part.length > 0)
    );
  }

  public static fromParts(parts: string[]): PhpNamespace {
    return new PhpNamespace(parts);
  }

  public pop(): string {
    return this.parts.pop() as string;
  }

  public getParts(): string[] {
    return this.parts;
  }

  public getHead(): string {
    return this.parts[0];
  }

  public getTail(): string {
    return this.parts[this.parts.length - 1];
  }

  public toString(): string {
    return this.parts.join(PhpNamespace.NS_SEPARATOR);
  }

  public append(...parts: (string | PhpNamespace)[]): PhpNamespace {
    return new PhpNamespace([
      ...this.parts,
      ...parts.flatMap(part => {
        if (typeof part === 'string') {
          return [part];
        }

        return part.getParts();
      }),
    ]);
  }

  public prepend(part: string | PhpNamespace): PhpNamespace {
    if (typeof part === 'string') {
      return new PhpNamespace([part, ...this.parts]);
    }

    return new PhpNamespace([...part.getParts(), ...this.parts]);
  }

  public isSubNamespaceOf(ns: PhpNamespace): boolean {
    if (this.parts.length < ns.parts.length) {
      return false;
    }

    return this.parts.slice(0, ns.parts.length).every((part, index) => part === ns.parts[index]);
  }
}
