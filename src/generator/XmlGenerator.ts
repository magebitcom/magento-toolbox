import { XMLBuilder, XmlBuilderOptions, XMLParser } from 'fast-xml-parser';

export default class XmlGenerator {
  public constructor(protected data: any) {}

  public static fromString(content: string): XmlGenerator {
    const parser = new XMLParser();
    const data = parser.parse(content);
    return new XmlGenerator(data);
  }

  public toString(options?: XmlBuilderOptions): string {
    const builder = new XMLBuilder({
      attributeNamePrefix: '@_',
      ignoreAttributes: false,
      textNodeName: '#text',
      indentBy: '    ',
      format: true,
      ...(options ?? {}),
    });

    return builder.build(this.data);
  }
}
