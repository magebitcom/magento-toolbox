import { Command } from 'command/Command';
import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { Uri, window, env } from 'vscode';

export default class CopyMagentoPathCommand extends Command {
  public static readonly TEMPLATE_EXTENSIONS = ['.phtml'];
  public static readonly WEB_EXTENSIONS = ['.css', '.js'];
  public static readonly IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

  private static readonly TEMPLATE_PATHS = [
    'view/frontend/templates/',
    'view/adminhtml/templates/',
    'view/base/templates/',
    'templates/',
  ];

  private static readonly WEB_PATHS = [
    'view/frontend/web/',
    'view/adminhtml/web/',
    'view/base/web/',
    'web/',
  ];

  constructor() {
    super('magento-toolbox.copyMagentoPath');
  }

  public async execute(file: Uri): Promise<void> {
    if (!file) {
      return;
    }

    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (!moduleIndexData) {
      return;
    }

    const module = moduleIndexData.getModuleByUri(file);

    if (!module) {
      return;
    }

    const paths = this.getPaths(file);

    if (!paths) {
      return;
    }

    const pathIndex = paths.findIndex(p => file.fsPath.lastIndexOf(p) !== -1);

    if (pathIndex === -1) {
      return;
    }

    const endIndex = file.fsPath.lastIndexOf(paths[pathIndex]);
    const offset = paths[pathIndex].length;
    const relativePath = file.fsPath.slice(offset + endIndex);

    const magentoPath = `${module.name}::${relativePath}`;

    await env.clipboard.writeText(magentoPath);
    window.showInformationMessage(`Copied: ${magentoPath}`);
  }

  private getPaths(file: Uri): string[] | undefined {
    if (CopyMagentoPathCommand.TEMPLATE_EXTENSIONS.some(ext => file.fsPath.endsWith(ext))) {
      return CopyMagentoPathCommand.TEMPLATE_PATHS;
    }

    if (
      CopyMagentoPathCommand.WEB_EXTENSIONS.some(ext => file.fsPath.endsWith(ext)) ||
      CopyMagentoPathCommand.IMAGE_EXTENSIONS.some(ext => file.fsPath.endsWith(ext))
    ) {
      return CopyMagentoPathCommand.WEB_PATHS;
    }

    return undefined;
  }
}
