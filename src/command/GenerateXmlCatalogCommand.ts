import { Command } from 'command/Command';
import Common from 'util/Common';
import { extensions, window } from 'vscode';

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

    // const catalog = await this.generateCatalog(workspaceFolder.uri);
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
