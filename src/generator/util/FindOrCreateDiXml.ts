import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import GenerateFromTemplate from './GenerateFromTemplate';
import FileHeader from 'common/xml/FileHeader';
import { MagentoScope } from 'types';
import Magento from 'util/Magento';

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

    return await GenerateFromTemplate.generate('xml/blank-di', {
      fileHeader,
    });
  }
}
