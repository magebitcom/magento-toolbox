import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import FindOrCreateCrontabXml from 'generator/util/FindOrCreateCrontabXml';
import { Uri } from 'vscode';
import { CronJobWizardData } from 'wizard/CronJobWizard';
import indentString from 'indent-string';
import Magento from 'util/Magento';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';

export default class CronJobXmlGenerator extends FileGenerator {
  public constructor(protected data: CronJobWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);
    const etcDirectory = Uri.joinPath(moduleDirectory, 'etc');
    const crontabFile = Uri.joinPath(etcDirectory, 'crontab.xml');

    // Prepare cron job data
    const jobName = this.data.cronName;
    const jobInstance = `${vendor}\\${module}\\Cron\\${this.data.className}`;

    // Get or create crontab.xml content
    const crontabXml = await FindOrCreateCrontabXml.execute(
      workspaceUri,
      vendor,
      module,
      MagentoScope.Global
    );

    // Create template renderer
    const renderer = new HandlebarsTemplateRenderer();

    // Generate job XML using the template
    const jobXml = await renderer.render(TemplatePath.XmlCronJob, {
      jobName,
      jobInstance,
      cronSchedule: this.data.cronSchedule,
    });

    // Check if group exists
    const groupExists = this.checkIfGroupExists(crontabXml, this.data.cronGroup);

    let insertXml: string;

    if (groupExists) {
      // Group exists, just use the job XML
      insertXml = indentString(jobXml, 4);
    } else {
      // Group doesn't exist, create it with the job XML
      insertXml = await renderer.render(
        TemplatePath.XmlCronGroup,
        {
          groupId: this.data.cronGroup,
        },
        {
          groupContent: jobXml,
        }
      );
    }

    // Find insertion position
    const insertPosition = this.getInsertPosition(crontabXml, this.data.cronGroup);

    // Insert new group
    const newCrontabXml =
      crontabXml.slice(0, insertPosition) +
      '\n' +
      indentString(insertXml, 4) +
      '\n' +
      crontabXml.slice(insertPosition);

    return new GeneratedFile(crontabFile, newCrontabXml, false);
  }

  /**
   * Check if group with given ID already exists
   */
  private checkIfGroupExists(crontabXml: string, groupId: string): boolean {
    const groupRegex = new RegExp(`<group\\s+id=["']${groupId}["']`, 'i');
    return groupRegex.test(crontabXml);
  }

  /**
   * Get position to insert new content
   */
  private getInsertPosition(crontabXml: string, groupId: string): number {
    if (this.checkIfGroupExists(crontabXml, groupId)) {
      // If group exists, find position after group opening tag
      const groupRegex = new RegExp(`<group\\s+id=["']${groupId}["'][^>]*>`, 'i');
      const match = groupRegex.exec(crontabXml);
      if (match) {
        return match.index + match[0].length;
      }
    }

    // Otherwise insert before </config>
    return crontabXml.indexOf('</config>');
  }
}
