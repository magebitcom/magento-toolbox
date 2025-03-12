import PhpNamespace from 'common/PhpNamespace';
import lowerFirst from 'lodash-es/lowerFirst';
import { MagentoScope } from 'types';
import { Uri, WorkspaceFolder } from 'vscode';
import FileSystem from './FileSystem';

export default class Magento {
  public static isPluginMethod(method: string) {
    return /^around|^before|^after/.test(method);
  }

  public static pluginMethodToMethodName(method: string): string | undefined {
    return lowerFirst(method.replace(/^around|^before|^after/, ''));
  }

  public static getUriWithArea(
    baseUri: Uri,
    filePath: string,
    area: MagentoScope = MagentoScope.Global
  ) {
    if (area === MagentoScope.Global) {
      return Uri.joinPath(baseUri, filePath);
    }

    return Uri.joinPath(baseUri, area, filePath);
  }

  public static getModuleDirectory(
    vendor: string,
    module: string,
    baseUri: Uri,
    path: string = ''
  ): Uri {
    return Uri.joinPath(baseUri, 'app', 'code', vendor, module, path);
  }

  public static getModuleName(vendor: string, module: string): string {
    return `${vendor}_${module}`;
  }

  public static getModuleNamespace(vendor: string, module: string): PhpNamespace {
    return PhpNamespace.fromParts([vendor, module]);
  }

  public static async isMagentoWorkspace(workspaceFolder: WorkspaceFolder): Promise<boolean> {
    const diXmlPath = Uri.joinPath(workspaceFolder.uri, 'app/etc/di.xml');
    // Check if the signature Magento file exists in the workspace
    try {
      return await FileSystem.fileExists(diXmlPath);
    } catch (error) {
      return false;
    }
  }
}
