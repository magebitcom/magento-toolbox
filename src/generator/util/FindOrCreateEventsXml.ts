import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import GenerateFromTemplate from './GenerateFromTemplate';
import { MagentoScope } from 'types';

export default class FindOrCreateEventsXml {
  public static async execute(
    workspaceUri: Uri,
    vendor: string,
    module: string,
    area: MagentoScope
  ): Promise<string> {
    const areaPath = area === MagentoScope.Global ? '' : area;
    const eventsFile = Uri.joinPath(
      workspaceUri,
      'app',
      'code',
      vendor,
      module,
      'etc',
      areaPath,
      'events.xml'
    );

    if (await FileSystem.fileExists(eventsFile)) {
      return await FileSystem.readFile(eventsFile);
    }

    return await GenerateFromTemplate.generate('xml/blank-events');
  }
}
