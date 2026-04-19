import IndexManager from 'indexer/IndexManager';
import ModuleIndexer from 'indexer/module/ModuleIndexer';
import { Uri } from 'vscode';

export class GetMagentoPath {
  public readonly TEMPLATE_EXTENSIONS = ['.phtml'];
  public readonly WEB_EXTENSIONS = ['.css', '.js'];
  public readonly IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

  public readonly TEMPLATE_PATHS = [
    'view/frontend/templates/',
    'view/adminhtml/templates/',
    'view/base/templates/',
    'templates/',
  ];

  public readonly WEB_PATHS = [
    'view/frontend/web/',
    'view/adminhtml/web/',
    'view/base/web/',
    'web/',
  ];

  public getMagentoPath(file: Uri): string | undefined {
    if (!file) {
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

    const moduleName = this.resolveModuleName(file, endIndex);

    if (!moduleName) {
      return;
    }

    return `${moduleName}::${relativePath}`;
  }

  private resolveModuleName(file: Uri, matchedPathStart: number): string | undefined {
    const moduleIndexData = IndexManager.getIndexData(ModuleIndexer.KEY);

    if (moduleIndexData) {
      const module = moduleIndexData.getModuleByUri(file, false);
      if (module) {
        return module.name;
      }
    }

    const normalized = file.fsPath.replace(/\\/g, '/');
    const before = normalized.slice(0, matchedPathStart).replace(/\/$/, '');
    const segments = before.split('/');
    const last = segments[segments.length - 1];

    if (last && /^[A-Z][A-Za-z0-9]*_[A-Z][A-Za-z0-9]*$/.test(last)) {
      return last;
    }

    return undefined;
  }

  private getPaths(file: Uri): string[] | undefined {
    if (this.TEMPLATE_EXTENSIONS.some(ext => file.fsPath.endsWith(ext))) {
      return this.TEMPLATE_PATHS;
    }

    if (
      this.WEB_EXTENSIONS.some(ext => file.fsPath.endsWith(ext)) ||
      this.IMAGE_EXTENSIONS.some(ext => file.fsPath.endsWith(ext))
    ) {
      return this.WEB_PATHS;
    }

    return undefined;
  }
}

export default new GetMagentoPath();
