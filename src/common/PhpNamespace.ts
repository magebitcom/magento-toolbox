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

  public getParts(): string[] {
    return this.parts;
  }

  public toString(): string {
    return this.parts.join(PhpNamespace.NS_SEPARATOR);
  }

  public append(part: string | PhpNamespace): PhpNamespace {
    if (typeof part === 'string') {
      return new PhpNamespace([...this.parts, part]);
    }

    return new PhpNamespace([...this.parts, ...part.getParts()]);
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
