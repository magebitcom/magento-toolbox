import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import FindOrCreateXml, { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import Magento from 'util/Magento';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import {
  SystemConfigFieldRow,
  SystemConfigGroupRow,
  SystemConfigSectionRow,
  SystemConfigWizardData,
} from 'wizard/SystemConfigWizard';
import { Uri } from 'vscode';
import { findOpeningTagWithId, insertAt, walkBackToLineStart } from './xmlHelpers';

export default class SystemConfigXmlGenerator extends FileGenerator {
  public constructor(protected data: SystemConfigWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target: XmlFileSpec = {
      filename: 'system.xml',
      blankTemplate: TemplatePath.XmlBlankSystem,
      area: MagentoScope.Adminhtml,
    };

    let xml = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const renderer = new HandlebarsTemplateRenderer();

    for (const section of this.data.sections ?? []) {
      xml = await this.mergeSection(xml, section, renderer);
    }

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, xml, false);
  }

  private async mergeSection(
    xml: string,
    section: SystemConfigSectionRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const groups = (this.data.groups ?? []).filter(g => g.sectionRef === section.id);
    const existing = findOpeningTagWithId(xml, 'section', section.id);

    if (!existing) {
      const sectionXml = await this.buildSectionXml(section, groups, renderer);
      const insertPos = walkBackToLineStart(xml, xml.indexOf('</system>'));
      return insertAt(xml, insertPos, sectionXml, { indent: 8 });
    }

    let result = xml;
    for (const group of groups) {
      result = await this.mergeGroup(result, section, group, renderer);
    }
    return result;
  }

  private async mergeGroup(
    xml: string,
    section: SystemConfigSectionRow,
    group: SystemConfigGroupRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const sectionMatch = findOpeningTagWithId(xml, 'section', section.id);
    if (!sectionMatch) {
      return xml;
    }
    const sectionCloseIdx = xml.indexOf('</section>', sectionMatch.endIndex);
    const searchEnd = sectionCloseIdx === -1 ? xml.length : sectionCloseIdx;

    const fields = (this.data.fields ?? []).filter(
      f => f.sectionRef === section.id && f.groupRef === group.id
    );
    const existing = findOpeningTagWithId(xml, 'group', group.id, sectionMatch.endIndex, searchEnd);

    if (!existing) {
      const groupXml = await this.buildGroupXml(group, fields, renderer);
      const insertPos = walkBackToLineStart(xml, sectionCloseIdx);
      return insertAt(xml, insertPos, groupXml, { indent: 12 });
    }

    let result = xml;
    for (const field of fields) {
      result = await this.mergeField(result, section, group, field, renderer);
    }
    return result;
  }

  private async mergeField(
    xml: string,
    section: SystemConfigSectionRow,
    group: SystemConfigGroupRow,
    field: SystemConfigFieldRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const sectionMatch = findOpeningTagWithId(xml, 'section', section.id);
    if (!sectionMatch) {
      return xml;
    }
    const sectionCloseIdx = xml.indexOf('</section>', sectionMatch.endIndex);
    const searchEnd = sectionCloseIdx === -1 ? xml.length : sectionCloseIdx;

    const groupMatch = findOpeningTagWithId(
      xml,
      'group',
      group.id,
      sectionMatch.endIndex,
      searchEnd
    );
    if (!groupMatch) {
      return xml;
    }
    const groupCloseIdx = xml.indexOf('</group>', groupMatch.endIndex);

    // Idempotence: skip if a field with the same id already exists in this group.
    const existingField = findOpeningTagWithId(
      xml,
      'field',
      field.id,
      groupMatch.endIndex,
      groupCloseIdx === -1 ? xml.length : groupCloseIdx
    );
    if (existingField) {
      return xml;
    }

    const fieldXml = await this.buildFieldXml(field, renderer);
    const insertPos = walkBackToLineStart(xml, groupCloseIdx);
    return insertAt(xml, insertPos, fieldXml, { indent: 16 });
  }

  private async buildSectionXml(
    section: SystemConfigSectionRow,
    groups: SystemConfigGroupRow[],
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const groupsXml = await this.buildGroupsXml(section, groups, renderer);
    return renderer.render(
      TemplatePath.XmlSystemSection,
      {
        sectionId: section.id,
        sortOrder: Number(section.sortOrder) || 10,
        label: section.label,
        tab: section.tab,
        resource: section.resource,
      },
      { groupsContent: groupsXml }
    );
  }

  private async buildGroupsXml(
    section: SystemConfigSectionRow,
    groups: SystemConfigGroupRow[],
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const xmls = await Promise.all(
      groups.map(group => {
        const fields = (this.data.fields ?? []).filter(
          f => f.sectionRef === section.id && f.groupRef === group.id
        );
        return this.buildGroupXml(group, fields, renderer);
      })
    );
    return xmls.join('\n');
  }

  private async buildGroupXml(
    group: SystemConfigGroupRow,
    fields: SystemConfigFieldRow[],
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const fieldsXml = await this.buildFieldsXml(fields, renderer);
    return renderer.render(
      TemplatePath.XmlSystemGroup,
      {
        groupId: group.id,
        sortOrder: Number(group.sortOrder) || 10,
        label: group.label,
      },
      { fieldsContent: fieldsXml }
    );
  }

  private async buildFieldsXml(
    fields: SystemConfigFieldRow[],
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const xmls = await Promise.all(fields.map(field => this.buildFieldXml(field, renderer)));
    return xmls.join('\n');
  }

  private buildFieldXml(
    field: SystemConfigFieldRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    return renderer.render(TemplatePath.XmlSystemField, {
      fieldId: field.id,
      fieldType: field.type,
      sortOrder: Number(field.sortOrder) || 10,
      label: field.label,
      sourceModel: field.sourceModel?.trim() || undefined,
      comment: field.comment?.trim() || undefined,
    });
  }
}
