import { Command } from 'command/Command';
import GetMagentoPath from 'common/GetMagentoPath';
import { Uri, window, env } from 'vscode';

export default class CopyMagentoPathCommand extends Command {
  constructor() {
    super('magento-toolbox.copyMagentoPath');
  }

  public async execute(file: Uri): Promise<void> {
    const magentoPath = GetMagentoPath.getMagentoPath(file);

    if (!magentoPath) {
      return;
    }

    await env.clipboard.writeText(magentoPath);
    window.showInformationMessage(`Copied: ${magentoPath}`);
  }
}
