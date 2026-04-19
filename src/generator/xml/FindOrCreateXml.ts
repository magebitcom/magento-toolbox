import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import FileHeader from 'common/xml/FileHeader';
import Magento from 'util/Magento';
import { MagentoScope } from 'types/global';
import { TemplatePath } from 'types/handlebars';
import HandlebarsTemplateRenderer from 'generator/HandlebarsTemplateRenderer';

export interface XmlFileSpec {
  filename: string;
  blankTemplate: TemplatePath;
  area?: MagentoScope;
}

export default class FindOrCreateXml {
  public static getUri(workspaceUri: Uri, vendor: string, module: string, spec: XmlFileSpec): Uri {
    const etcDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri, 'etc');
    return Magento.getUriWithArea(etcDirectory, spec.filename, spec.area ?? MagentoScope.Global);
  }

  public static async execute(
    workspaceUri: Uri,
    vendor: string,
    module: string,
    spec: XmlFileSpec
  ): Promise<string> {
    const fileUri = FindOrCreateXml.getUri(workspaceUri, vendor, module, spec);

    if (await FileSystem.fileExists(fileUri)) {
      return await FileSystem.readFile(fileUri);
    }

    const renderer = new HandlebarsTemplateRenderer();
    const fileHeader = FileHeader.getHeader(Magento.getModuleName(vendor, module));

    return await renderer.render(spec.blankTemplate, { fileHeader });
  }
}
