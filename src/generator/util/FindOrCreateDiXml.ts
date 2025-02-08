import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import GenerateFromTemplate from './GenerateFromTemplate';

class FindOrCreateDiXml {
  public async execute(workspaceUri: Uri, vendor: string, module: string): Promise<string> {
    const diFile = Uri.joinPath(workspaceUri, 'app', 'code', vendor, module, 'etc', 'di.xml');

    if (await FileSystem.fileExists(diFile)) {
      return await FileSystem.readFile(diFile);
    }

    return await GenerateFromTemplate.generate('xml/blank-di');
  }
}

export default new FindOrCreateDiXml();
