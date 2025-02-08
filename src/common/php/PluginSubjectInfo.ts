import IndexStorage from 'common/IndexStorage';
import DiIndexer from 'indexer/DiIndexer';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpMethod } from 'parser/php/PhpMethod';
import Magento from 'util/Magento';

export default class PluginSubjectInfo {
  constructor(private readonly phpFile: PhpFile) {}

  public getClassPlugins(phpClass: PhpClass) {
    const diIndex = IndexStorage.get(DiIndexer.KEY);

    if (!diIndex) {
      return [];
    }

    const fqn = this.phpFile.namespace + '\\' + phpClass.name;

    if (!fqn) {
      return [];
    }

    const pluginClassData = diIndex.findPluginsForType(fqn);

    return pluginClassData;
  }

  public isValidPluginClass(phpClass: PhpClass): boolean {
    if (phpClass.ast.isFinal) {
      return false;
    }

    if (
      phpClass.ast.implements &&
      phpClass.ast.implements.find(item => item.name === 'NoninterceptableInterface')
    ) {
      return false;
    }

    return true;
  }

  public isValidPluginMethod(method: PhpMethod): boolean {
    if (method.ast.visibility !== 'public') {
      return false;
    }

    if (method.name === '__construct' || method.name === '__destruct') {
      return false;
    }

    return true;
  }

  public getValidPluginClasses(): PhpClass[] {
    return this.phpFile.classes.filter(phpClass => {
      return this.isValidPluginClass(phpClass);
    });
  }

  public getValidPluginMethods(): PhpMethod[] {
    return this.phpFile.classes.flatMap(phpClass => {
      if (!this.isValidPluginClass(phpClass)) {
        return [];
      }

      return phpClass.methods.filter(phpMethod => {
        return this.isValidPluginMethod(phpMethod);
      });
    });
  }
}
