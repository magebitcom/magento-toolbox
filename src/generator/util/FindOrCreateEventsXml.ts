import { Uri } from 'vscode';
import FileSystem from 'util/FileSystem';
import { MagentoScope } from 'types/global';
import FileHeader from 'common/xml/FileHeader';
import HandlebarsTemplateRenderer from '../HandlebarsTemplateRenderer';

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

    const renderer = new HandlebarsTemplateRenderer();

    const fileHeader = FileHeader.getHeader(`${vendor}_${module}`);

    return await renderer.render('xml/blank-events', {
      fileHeader,
    });
  }
}
