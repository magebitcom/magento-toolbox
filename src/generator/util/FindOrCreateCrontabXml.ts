import Magento from 'util/Magento';
import { Uri } from 'vscode';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';
import FileSystem from 'util/FileSystem';
import FileHeader from 'common/xml/FileHeader';

export default class FindOrCreateCrontabXml {
  public static async execute(
    workspaceUri: Uri,
    vendor: string,
    module: string,
    area: MagentoScope = MagentoScope.Global
  ): Promise<string> {
    const modulePath = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const crontabFile = Magento.getUriWithArea(modulePath, 'crontab.xml', area);

    if (await FileSystem.fileExists(crontabFile)) {
      return await FileSystem.readFile(crontabFile);
    }

    const fileHeader = FileHeader.getHeader(module);

    const renderer = new HandlebarsTemplateRenderer();

    return await renderer.render(TemplatePath.XmlBlankCrontab, {
      fileHeader,
    });
  }
}
