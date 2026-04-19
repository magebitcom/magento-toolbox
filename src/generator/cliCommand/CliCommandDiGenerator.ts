import indentString from 'indent-string';
import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { CliCommandWizardData } from 'wizard/CliCommandWizard';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';

export default class CliCommandDiGenerator extends AbstractXmlFragmentGenerator<CliCommandWizardData> {
  private static readonly COMMAND_LIST = 'Magento\\Framework\\Console\\CommandList';
  private static readonly COMMANDS_ARGUMENT_REGEX =
    /<argument\s+name=["']commands["']\s+xsi:type=["']array["']\s*>/i;

  protected getTarget(): XmlFileSpec {
    return {
      filename: 'di.xml',
      blankTemplate: TemplatePath.XmlBlankDi,
      area: MagentoScope.Global,
    };
  }

  protected computeInsertPosition(xml: string): number {
    const match = this.findCommandsArgumentOpeningTag(xml);
    return match ? match.index + match[0].length : xml.indexOf('</config>');
  }

  protected getFragmentSeparator(existingXml: string): { before: string; after: string } {
    if (this.findCommandsArgumentOpeningTag(existingXml)) {
      // When merging into an existing <argument>, the char after the insert
      // position is already a newline — so skip our trailing '\n' to keep
      // sibling <item> elements adjacent without a blank line between them.
      return { before: '\n', after: '' };
    }
    return { before: '\n', after: '\n' };
  }

  protected async renderFragment(
    renderer: HandlebarsTemplateRenderer,
    { existingXml }: { existingXml: string }
  ): Promise<string> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const itemClass = Magento.getModuleNamespace(vendor, module)
      .append('Console', 'Command', this.data.className)
      .toString();

    const itemXml = await renderer.render(TemplatePath.XmlDiCliCommandItem, {
      itemName: this.data.itemName,
      itemClass,
    });

    if (this.findCommandsArgumentOpeningTag(existingXml)) {
      // Item is being inserted inside an existing <argument name="commands">
      // that sits at col 12; item belongs at col 16. Base class indents the
      // fragment by 4, so we pre-indent by 12 to land at 16.
      return indentString(itemXml, 12);
    }

    const argumentsXml = await renderer.render(
      TemplatePath.XmlDiCliCommandArguments,
      {},
      { itemsContent: itemXml }
    );

    return renderer.render(
      TemplatePath.XmlDiType,
      { subjectNamespace: CliCommandDiGenerator.COMMAND_LIST },
      { typeContent: argumentsXml }
    );
  }

  private findCommandsArgumentOpeningTag(xml: string): { index: number; 0: string } | null {
    const match = xml.match(CliCommandDiGenerator.COMMANDS_ARGUMENT_REGEX);
    if (!match || match.index === undefined) {
      return null;
    }
    return { index: match.index, 0: match[0] };
  }
}
