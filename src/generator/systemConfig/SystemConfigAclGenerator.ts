import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import FindOrCreateXml, { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import Magento from 'util/Magento';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import { SystemConfigSectionRow, SystemConfigWizardData } from 'wizard/SystemConfigWizard';
import { Uri } from 'vscode';
import { findOpeningTagWithId, insertAt, walkBackToLineStart } from './xmlHelpers';

/**
 * Declares each section's ACL resource id under
 * Magento_Backend::admin/Magento_Config::config. If the full ancestor chain
 * is missing from the file, writes it. Idempotent per resource id.
 */
export default class SystemConfigAclGenerator extends FileGenerator {
  private static readonly ADMIN = 'Magento_Backend::admin';
  private static readonly CONFIG = 'Magento_Config::config';

  public constructor(protected data: SystemConfigWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target: XmlFileSpec = {
      filename: 'acl.xml',
      blankTemplate: TemplatePath.XmlBlankAcl,
      area: MagentoScope.Adminhtml,
    };

    let xml = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const renderer = new HandlebarsTemplateRenderer();

    for (const section of this.data.sections ?? []) {
      if (!section.resource || section.resource.length === 0) {
        continue;
      }
      xml = await this.mergeResource(xml, section, renderer);
    }

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, xml, false);
  }

  private async mergeResource(
    xml: string,
    section: SystemConfigSectionRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const leaf = await renderer.render(TemplatePath.XmlAclResource, {
      resourceId: section.resource,
      title: section.label,
    });

    // Idempotence — if this resource already lives anywhere in the file, skip.
    if (findOpeningTagWithId(xml, 'resource', section.resource)) {
      return xml;
    }

    const configNode = findOpeningTagWithId(xml, 'resource', SystemConfigAclGenerator.CONFIG);
    if (configNode) {
      // Insert inside <resource id="Magento_Config::config">.
      const closeIdx = this.findMatchingClose(xml, configNode);
      const insertPos = walkBackToLineStart(xml, closeIdx);
      // The config node sits at col 16 (admin > stores > stores_settings > config),
      // so its children should land at col 20. Base walk-back leaves pos at start of
      // the indent line so we indent the fragment to col 20.
      const indent = this.measureIndent(xml, closeIdx) + 4;
      return insertAt(xml, insertPos, leaf, { indent });
    }

    const adminNode = findOpeningTagWithId(xml, 'resource', SystemConfigAclGenerator.ADMIN);
    if (adminNode) {
      // Insert inside <resource id="Magento_Backend::admin">.
      const closeIdx = this.findMatchingClose(xml, adminNode);
      const insertPos = walkBackToLineStart(xml, closeIdx);
      const indent = this.measureIndent(xml, closeIdx) + 4;
      return insertAt(xml, insertPos, leaf, { indent });
    }

    // No <acl> tree yet — write the full scaffolding.
    const scaffold = [
      '<acl>',
      '    <resources>',
      `        <resource id="${SystemConfigAclGenerator.ADMIN}">`,
      `            ${leaf}`,
      '        </resource>',
      '    </resources>',
      '</acl>',
    ].join('\n');
    const insertPos = walkBackToLineStart(xml, xml.indexOf('</config>'));
    return insertAt(xml, insertPos, scaffold, { indent: 4 });
  }

  private findMatchingClose(xml: string, openTag: { endIndex: number }): number {
    const closeIdx = xml.indexOf('</resource>', openTag.endIndex);
    if (closeIdx === -1) {
      return xml.length;
    }
    return closeIdx;
  }

  private measureIndent(xml: string, idx: number): number {
    if (idx <= 0) {
      return 0;
    }
    let count = 0;
    let i = idx - 1;
    while (i >= 0 && (xml[i] === ' ' || xml[i] === '\t')) {
      count++;
      i--;
    }
    return count;
  }
}
