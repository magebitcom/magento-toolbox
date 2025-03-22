import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import FileHeader from 'common/xml/FileHeader';
import { MagentoScope } from 'types/global';
import Magento from 'util/Magento';
import HandlebarsTemplateRenderer from '../HandlebarsTemplateRenderer';

export default class FindOrCreateDiXml {
  public static async execute(
    workspaceUri: Uri,
    vendor: string,
    module: string,
    area: MagentoScope = MagentoScope.Global
  ): Promise<string> {
    const modulePath = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    const diFile = Magento.getUriWithArea(modulePath, 'di.xml', area);

    if (await FileSystem.fileExists(diFile)) {
      return await FileSystem.readFile(diFile);
    }

    const fileHeader = FileHeader.getHeader(module);

    const renderer = new HandlebarsTemplateRenderer();

    return await renderer.render('xml/blank-di', {
      fileHeader,
    });
  }
}
