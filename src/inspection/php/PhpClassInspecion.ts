import { TextDocument, Uri, workspace } from 'vscode';
import { PhpFileInfo } from './PhpFileInfo';
import IndexStorage from 'common/IndexStorage';
import DiIndexer from 'indexer/DiIndexer';
import { DiPlugin } from 'indexer/data/DiIndexData';
import { PhpFile } from 'parser/php/PhpFile';
import PhpParser from 'parser/php/Parser';
import { first } from 'lodash-es';
import Magento from 'util/Magento';

export default class PhpClassInspecion {
  public readonly fileInfo: PhpFileInfo;
  private parser: PhpParser;
  private phpFile: PhpFile | undefined;

  constructor(private readonly textDocument: TextDocument) {
    this.fileInfo = new PhpFileInfo(this.textDocument);
    this.parser = new PhpParser();
  }

  public static async fromUri(uri: Uri) {
    if (!uri.fsPath.endsWith('.php')) {
      throw new Error('File is not a PHP file');
    }

    const textDocument = await workspace.openTextDocument(uri);

    return new PhpClassInspecion(textDocument);
  }

  public getClassInterceptors(): DiPlugin[] {
    const diIndex = IndexStorage.get(DiIndexer.KEY);

    if (!diIndex) {
      return [];
    }

    const fqn = this.fileInfo.name?.toString();

    if (!fqn) {
      return [];
    }

    const pluginClassData = diIndex.findPluginsForType(fqn);

    return pluginClassData;
  }

  public async getPluginMethods(pluginUri: Uri) {
    const phpFile = await this.parser.parse(pluginUri);
    const pluginClass = first(phpFile.classes);

    if (!pluginClass) {
      return [];
    }

    return pluginClass.methods
      .filter(method => Magento.isPluginMethod(method.name))
      .map(method => {
        return Magento.pluginMethodToMethodName(method.name);
      });
  }
}
