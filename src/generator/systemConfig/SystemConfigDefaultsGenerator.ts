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
import { findSimpleOpeningTag, insertAt, walkBackToLineStart } from './xmlHelpers';

export default class SystemConfigDefaultsGenerator extends FileGenerator {
  public constructor(protected data: SystemConfigWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target: XmlFileSpec = {
      filename: 'config.xml',
      blankTemplate: TemplatePath.XmlBlankConfig,
      area: MagentoScope.Global,
    };

    let xml = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const renderer = new HandlebarsTemplateRenderer();

    // Collect every section that has at least one field-with-default, whether
    // or not the section itself was declared in the wizard. config.xml's
    // default tree is keyed by id string and doesn't need section metadata.
    const sectionIds = new Set<string>();
    for (const f of this.data.fields ?? []) {
      if (f.sectionRef && (f.default ?? '').length > 0) {
        sectionIds.add(f.sectionRef);
      }
    }

    for (const sectionId of sectionIds) {
      const sectionData =
        (this.data.sections ?? []).find(s => s.id === sectionId) ??
        ({
          id: sectionId,
          label: '',
          sortOrder: 10,
          tab: '',
          resource: '',
        } as SystemConfigSectionRow);
      xml = await this.mergeSection(xml, sectionData, renderer);
    }

    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);
    return new GeneratedFile(uri, xml, false);
  }

  private sectionHasDefaults(section: SystemConfigSectionRow): boolean {
    return (this.data.fields ?? []).some(
      f => f.sectionRef === section.id && (f.default ?? '').length > 0
    );
  }

  private async mergeSection(
    xml: string,
    section: SystemConfigSectionRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const defaultTag = findSimpleOpeningTag(xml, 'default');

    if (!defaultTag) {
      // Wrap whole <default> and insert before </config>.
      const sectionXml = await this.buildSectionXml(section, renderer);
      const indented = sectionXml
        .split('\n')
        .map(l => '    ' + l)
        .join('\n');
      const wrapped = `<default>\n${indented}\n</default>`;
      const insertPos = walkBackToLineStart(xml, xml.indexOf('</config>'));
      return insertAt(xml, insertPos, wrapped, { indent: 4 });
    }

    const defaultCloseIdx = xml.indexOf('</default>', defaultTag.endIndex);
    const searchEnd = defaultCloseIdx === -1 ? xml.length : defaultCloseIdx;
    const existingSection = findSimpleOpeningTag(xml, section.id, defaultTag.endIndex, searchEnd);

    if (!existingSection) {
      const sectionXml = await this.buildSectionXml(section, renderer);
      const insertPos = walkBackToLineStart(xml, defaultCloseIdx);
      return insertAt(xml, insertPos, sectionXml, { indent: 8 });
    }

    const declaredGroups = (this.data.groups ?? []).filter(g => g.sectionRef === section.id);
    const declaredGroupIds = new Set(declaredGroups.map(g => g.id));
    // Any groupRef mentioned by a field with a default but not declared above.
    const undeclaredGroupIds = new Set<string>();
    for (const f of this.data.fields ?? []) {
      if (
        f.sectionRef === section.id &&
        f.groupRef &&
        (f.default ?? '').length > 0 &&
        !declaredGroupIds.has(f.groupRef)
      ) {
        undeclaredGroupIds.add(f.groupRef);
      }
    }
    const groups: SystemConfigGroupRow[] = [
      ...declaredGroups,
      ...Array.from(undeclaredGroupIds).map(id => ({
        sectionRef: section.id,
        id,
        label: '',
        sortOrder: 10,
      })),
    ];

    let result = xml;
    for (const group of groups) {
      if (!this.groupHasDefaults(section, group)) {
        continue;
      }
      result = await this.mergeGroup(result, section, group, renderer);
    }
    return result;
  }

  private groupHasDefaults(section: SystemConfigSectionRow, group: SystemConfigGroupRow): boolean {
    return (this.data.fields ?? []).some(
      f => f.sectionRef === section.id && f.groupRef === group.id && (f.default ?? '').length > 0
    );
  }

  private async mergeGroup(
    xml: string,
    section: SystemConfigSectionRow,
    group: SystemConfigGroupRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const sectionMatch = findSimpleOpeningTag(xml, section.id);
    if (!sectionMatch) {
      return xml;
    }
    const sectionCloseIdx = xml.indexOf(`</${section.id}>`, sectionMatch.endIndex);
    const searchEnd = sectionCloseIdx === -1 ? xml.length : sectionCloseIdx;
    const existingGroup = findSimpleOpeningTag(xml, group.id, sectionMatch.endIndex, searchEnd);

    const fields = (this.data.fields ?? []).filter(
      f => f.sectionRef === section.id && f.groupRef === group.id && (f.default ?? '').length > 0
    );

    if (!existingGroup) {
      const groupXml = await this.buildGroupXml(group, fields, renderer);
      const insertPos = walkBackToLineStart(xml, sectionCloseIdx);
      return insertAt(xml, insertPos, groupXml, { indent: 12 });
    }

    const groupCloseIdx = xml.indexOf(`</${group.id}>`, existingGroup.endIndex);
    let result = xml;
    for (const field of fields) {
      result = await this.mergeField(result, section, group, field, renderer, groupCloseIdx);
    }
    return result;
  }

  private async mergeField(
    xml: string,
    section: SystemConfigSectionRow,
    group: SystemConfigGroupRow,
    field: SystemConfigFieldRow,
    renderer: HandlebarsTemplateRenderer,
    groupCloseHint: number
  ): Promise<string> {
    // Recompute group close (string mutates with each field insertion).
    const sectionMatch = findSimpleOpeningTag(xml, section.id);
    if (!sectionMatch) {
      return xml;
    }
    const groupMatch = findSimpleOpeningTag(xml, group.id, sectionMatch.endIndex);
    if (!groupMatch) {
      return xml;
    }
    const groupCloseIdx = xml.indexOf(`</${group.id}>`, groupMatch.endIndex);
    if (groupCloseIdx === -1) {
      return xml;
    }

    // Idempotence: skip if a tag with the same field id already lives in this group.
    const existingField = findSimpleOpeningTag(xml, field.id, groupMatch.endIndex, groupCloseIdx);
    if (existingField) {
      return xml;
    }

    const fieldXml = await this.buildFieldXml(field, renderer);
    const insertPos = walkBackToLineStart(xml, groupCloseIdx);
    return insertAt(xml, insertPos, fieldXml, { indent: 16 });
  }

  private async buildSectionXml(
    section: SystemConfigSectionRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    const declaredGroups = (this.data.groups ?? []).filter(
      g => g.sectionRef === section.id && this.groupHasDefaults(section, g)
    );
    const declaredIds = new Set(declaredGroups.map(g => g.id));
    const syntheticGroupIds = new Set<string>();
    for (const f of this.data.fields ?? []) {
      if (
        f.sectionRef === section.id &&
        f.groupRef &&
        (f.default ?? '').length > 0 &&
        !declaredIds.has(f.groupRef)
      ) {
        syntheticGroupIds.add(f.groupRef);
      }
    }
    const groups: SystemConfigGroupRow[] = [
      ...declaredGroups,
      ...Array.from(syntheticGroupIds).map(id => ({
        sectionRef: section.id,
        id,
        label: '',
        sortOrder: 10,
      })),
    ];
    const groupsXml = await this.buildGroupsXml(section, groups, renderer);
    return renderer.render(
      TemplatePath.XmlConfigSection,
      { sectionId: section.id },
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
          f =>
            f.sectionRef === section.id && f.groupRef === group.id && (f.default ?? '').length > 0
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
    const fieldsXml = (
      await Promise.all(fields.map(field => this.buildFieldXml(field, renderer)))
    ).join('\n');
    return renderer.render(
      TemplatePath.XmlConfigGroup,
      { groupId: group.id },
      { fieldsContent: fieldsXml }
    );
  }

  private buildFieldXml(
    field: SystemConfigFieldRow,
    renderer: HandlebarsTemplateRenderer
  ): Promise<string> {
    return renderer.render(TemplatePath.XmlConfigField, {
      fieldId: field.id,
      defaultValue: field.default ?? '',
    });
  }
}
