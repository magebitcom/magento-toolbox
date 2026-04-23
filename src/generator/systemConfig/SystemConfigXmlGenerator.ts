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

    // Process every section that's either declared in the wizard or merely
    // referenced by a group/field row. This lets users target sections that
    // already exist in the module's system.xml without re-declaring them.
    const sectionIds = new Set<string>();
    for (const s of this.data.sections ?? []) {
      if (s.id) sectionIds.add(s.id);
    }
    for (const g of this.data.groups ?? []) {
      if (g.sectionRef) sectionIds.add(g.sectionRef);
    }
    for (const f of this.data.fields ?? []) {
      if (f.sectionRef) sectionIds.add(f.sectionRef);
    }

    for (const sectionId of sectionIds) {
      xml = await this.mergeSectionById(xml, sectionId, renderer);
    }

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, xml, false);
  }

  private async mergeSectionById(
    xml: string,
    sectionId: string,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const sectionData = (this.data.sections ?? []).find(s => s.id === sectionId);
    const existing = findOpeningTagWithId(xml, 'section', sectionId);
    const declaredGroups = (this.data.groups ?? []).filter(g => g.sectionRef === sectionId);

    if (!existing) {
      if (!sectionData) {
        // User referenced an unknown section and didn't declare it — nothing
        // sensible to insert here.
        return xml;
      }
      const sectionXml = await this.buildSectionXml(sectionData, declaredGroups, renderer);
      const insertPos = walkBackToLineStart(xml, xml.indexOf('</system>'));
      return insertAt(xml, insertPos, sectionXml, { indent: 8 });
    }

    // Section already lives in the file. Use a placeholder sectionData so the
    // downstream merge helpers can still key off `section.id`.
    const section: SystemConfigSectionRow = sectionData ?? {
      id: sectionId,
      label: '',
      sortOrder: 10,
      tab: '',
      resource: '',
    };

    let result = xml;
    // Merge every declared group (might be fresh, might already exist).
    for (const group of declaredGroups) {
      result = await this.mergeGroup(result, section, group, renderer);
    }
    // Also handle groups that weren't declared but are referenced by fields —
    // those must already exist in the XML for us to target them.
    const declaredGroupIds = new Set(declaredGroups.map(g => g.id));
    const undeclaredGroupIds = new Set<string>();
    for (const f of this.data.fields ?? []) {
      if (f.sectionRef === sectionId && f.groupRef && !declaredGroupIds.has(f.groupRef)) {
        undeclaredGroupIds.add(f.groupRef);
      }
    }
    for (const groupId of undeclaredGroupIds) {
      const syntheticGroup: SystemConfigGroupRow = {
        sectionRef: sectionId,
        id: groupId,
        label: '',
        sortOrder: 10,
      };
      const fields = (this.data.fields ?? []).filter(
        f => f.sectionRef === sectionId && f.groupRef === groupId
      );
      for (const field of fields) {
        result = await this.mergeField(result, section, syntheticGroup, field, renderer);
      }
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
