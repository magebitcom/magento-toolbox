import { Uri } from 'vscode';
import FileGenerator from './FileGenerator';

export default abstract class ModuleFileGenerator extends FileGenerator {
  public getModuleDirectory(vendor: string, module: string, baseUri: Uri): Uri {
    return Uri.joinPath(baseUri, 'app', 'code', vendor, module);
  }

  public getModuleName(vendor: string, module: string): string {
    return `${vendor}_${module}`;
  }

  public getModuleNamespace(vendor: string, module: string): string {
    return `${vendor}\\${module}`;
  }
}
