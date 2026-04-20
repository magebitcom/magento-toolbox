import { Uri } from 'vscode';
import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import FindOrCreateXml, { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import GeneratedFile from 'generator/GeneratedFile';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { CronGroupWizardData } from 'wizard/CronGroupWizard';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import { findOpeningTagWithId } from 'generator/systemConfig/xmlHelpers';

export default class CronGroupXmlGenerator extends AbstractXmlFragmentGenerator<CronGroupWizardData> {
  protected getTarget(): XmlFileSpec {
    return {
      filename: 'cron_groups.xml',
      blankTemplate: TemplatePath.XmlBlankCronGroups,
      area: MagentoScope.Global,
    };
  }

  /**
   * Override the base generate so we can short-circuit cleanly when the group
   * id is already declared in the file — otherwise the base class's wrapping
   * newlines would add stray blank lines to an unchanged file.
   */
  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const target = this.getTarget();
    const existing = await FindOrCreateXml.execute(workspaceUri, vendor, module, target);
    const uri = FindOrCreateXml.getUri(workspaceUri, vendor, module, target);

    if (findOpeningTagWithId(existing, 'group', this.data.groupId)) {
      return new GeneratedFile(uri, existing, false);
    }

    return super.generate(workspaceUri);
  }

  protected renderFragment(renderer: HandlebarsTemplateRenderer): Promise<string> {
    return renderer.render(TemplatePath.XmlCronGroupsGroup, {
      groupId: this.data.groupId,
      scheduleGenerateEvery: Number(this.data.scheduleGenerateEvery) || 15,
      scheduleAheadFor: Number(this.data.scheduleAheadFor) || 20,
      scheduleLifetime: Number(this.data.scheduleLifetime) || 15,
      historyCleanupEvery: Number(this.data.historyCleanupEvery) || 10,
      historySuccessLifetime: Number(this.data.historySuccessLifetime) || 60,
      historyFailureLifetime: Number(this.data.historyFailureLifetime) || 4320,
      useSeparateProcess: this.data.useSeparateProcess ? 1 : 0,
    });
  }
}
