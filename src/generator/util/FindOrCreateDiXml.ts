import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import GenerateFromTemplate from './GenerateFromTemplate';
import FileHeader from 'common/xml/FileHeader';

export default class FindOrCreateDiXml {
  public static async execute(workspaceUri: Uri, vendor: string, module: string): Promise<string> {
    const diFile = Uri.joinPath(workspaceUri, 'app', 'code', vendor, module, 'etc', 'di.xml');

    if (await FileSystem.fileExists(diFile)) {
      return await FileSystem.readFile(diFile);
    }

    const fileHeader = FileHeader.getHeader(module);

    return await GenerateFromTemplate.generate('xml/blank-di', {
      fileHeader,
    });
  }
}
