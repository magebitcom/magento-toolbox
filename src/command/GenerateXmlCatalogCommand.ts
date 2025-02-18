import { Command } from 'command/Command';
import MagentoCli from 'common/MagentoCli';
import Common from 'util/Common';
import { ConfigurationTarget, extensions, Uri, window, workspace, WorkspaceFolder } from 'vscode';
import FileSystem from 'util/FileSystem';
import get from 'lodash-es/get';
import { XMLParser } from 'fast-xml-parser';
import XmlGenerator from 'generator/XmlGenerator';

export default class GenerateXmlCatalogCommand extends Command {
  private static readonly XML_EXTENSION = 'redhat.vscode-xml';

  constructor() {
    super('magento-toolbox.generateXmlCatalog');
  }

  public async execute(...args: any[]): Promise<void> {
    if (!this.checkExtension()) {
      return;
    }

    const workspaceFolder = Common.getActiveWorkspaceFolder();

    if (!workspaceFolder) {
      window.showErrorMessage('No active workspace folder');
      return;
    }

    const catalogLocation = Uri.joinPath(workspaceFolder.uri, '.vscode/magento-catalog.xml');

    if (!(await FileSystem.fileExists(catalogLocation))) {
      const success = await this.generateCatalog(workspaceFolder);

      if (!success) {
        return;
      }
    }

    await this.formatAndWriteCatalog(catalogLocation, workspaceFolder.uri);
    await this.updateXmlConfig(workspaceFolder, catalogLocation);

    window.showInformationMessage('XML URN catalog generated and configured successfully');
  }

  private async formatAndWriteCatalog(catalogLocation: Uri, workspaceUri: Uri) {
    const catalogXmlString = await FileSystem.readFile(catalogLocation);
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name, jpath) => {
        return jpath === 'project.component.resource';
      },
    });
    const catalogXml = xmlParser.parse(catalogXmlString);

    const xmlCatalog: any = {
      catalog: {
        '@_xmlns': 'urn:oasis:names:tc:entity:xmlns:xml:catalog',
        system: [],
      },
    };

    const components = get(catalogXml, 'project.component', []);

    for (const component of components) {
      if (!component.resource) {
        continue;
      }

      for (const resource of component.resource) {
        let location = resource['@_location'];
        location = location.replace('$PROJECT_DIR$', workspaceUri.fsPath);
        xmlCatalog.catalog.system.push({
          '@_systemId': resource['@_url'],
          '@_uri': location,
        });
      }
    }

    const xmlGenerator = new XmlGenerator(xmlCatalog);
    const formattedCatalog = xmlGenerator.toString();

    await FileSystem.writeFile(catalogLocation, formattedCatalog);
  }

  private async generateCatalog(workspaceFolder: WorkspaceFolder): Promise<boolean> {
    const catalogLocation = Uri.joinPath(workspaceFolder.uri, '.vscode/magento-catalog.xml');

    const magentoCli = new MagentoCli();

    try {
      await magentoCli.run('dev:urn-catalog:generate', [catalogLocation.fsPath]);
    } catch (error) {
      console.error(error);

      window.showErrorMessage(
        'Failed to generate URN catalog. Try running this command manually: \n\n' +
          `bin/magento dev:urn-catalog:generate ${catalogLocation.fsPath}`
      );

      return false;
    }

    return true;
  }

  private async updateXmlConfig(workspaceFolder: WorkspaceFolder, catalogLocation: Uri) {
    const xmlConfig = workspace.getConfiguration('xml', workspaceFolder.uri);

    const catalogs = xmlConfig.get<string[]>('catalogs', []);

    if (!catalogs.includes(catalogLocation.fsPath)) {
      catalogs.push(catalogLocation.fsPath);
    }

    await xmlConfig.update('catalogs', catalogs, ConfigurationTarget.Workspace);
  }

  private checkExtension(): boolean {
    if (!extensions.getExtension(GenerateXmlCatalogCommand.XML_EXTENSION)) {
      window.showWarningMessage(
        `This command requires ${GenerateXmlCatalogCommand.XML_EXTENSION} extension to be installed.`
      );

      return false;
    }

    return true;
  }
}
