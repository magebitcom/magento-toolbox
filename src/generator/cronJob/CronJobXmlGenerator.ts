import indentString from 'indent-string';
import AbstractXmlFragmentGenerator from 'generator/xml/AbstractXmlFragmentGenerator';
import { XmlFileSpec } from 'generator/xml/FindOrCreateXml';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import Magento from 'util/Magento';
import { CronJobWizardData } from 'wizard/CronJobWizard';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';

export default class CronJobXmlGenerator extends AbstractXmlFragmentGenerator<CronJobWizardData> {
  protected getTarget(): XmlFileSpec {
    return {
      filename: 'crontab.xml',
      blankTemplate: TemplatePath.XmlBlankCrontab,
      area: MagentoScope.Global,
    };
  }

  protected computeInsertPosition(xml: string): number {
    const match = this.findGroupOpeningTag(xml);
    return match ? match.index + match[0].length : xml.indexOf('</config>');
  }

  protected async renderFragment(
    renderer: HandlebarsTemplateRenderer,
    { existingXml }: { existingXml: string }
  ): Promise<string> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const jobInstance = `${vendor}\\${module}\\Cron\\${this.data.className}`;

    const jobXml = await renderer.render(TemplatePath.XmlCronJob, {
      jobName: this.data.cronName,
      jobInstance,
      cronSchedule: this.data.cronSchedule,
    });

    if (this.findGroupOpeningTag(existingXml)) {
      // Job is being inserted inside an existing <group>, so pre-indent by 4 —
      // the base class adds another 4, resulting in the 8-space total that
      // matches the two-level <config>/<group>/<job> nesting.
      return indentString(jobXml, 4);
    }

    return renderer.render(
      TemplatePath.XmlCronGroup,
      { groupId: this.data.cronGroup },
      { groupContent: jobXml }
    );
  }

  private findGroupOpeningTag(xml: string): { index: number; 0: string } | null {
    const groupRegex = new RegExp(`<group\\s+id=["']${this.data.cronGroup}["'][^>]*>`, 'i');
    const match = xml.match(groupRegex);
    if (!match || match.index === undefined) {
      return null;
    }
    return { index: match.index, 0: match[0] };
  }
}
