import IndexStorage from 'common/IndexStorage';
import DiIndexer from 'indexer/DiIndexer';
import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpInterface } from 'parser/php/PhpInterface';
import { PhpMethod } from 'parser/php/PhpMethod';

export default class PluginSubjectInfo {
  constructor(private readonly phpFile: PhpFile) {}

  public getPlugins(phpClasslike: PhpClass | PhpInterface) {
    const diIndex = IndexStorage.get(DiIndexer.KEY);

    if (!diIndex) {
      return [];
    }

    const fqn = phpClasslike.namespace + '\\' + phpClasslike.name;

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

  public isValidPluginInterface(phpInterface: PhpInterface): boolean {
    if (
      phpInterface.ast.extends &&
      phpInterface.ast.extends.find(item => item.name === 'NoninterceptableInterface')
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
    return (this.phpFile.classes || []).filter(phpClass => {
      return this.isValidPluginClass(phpClass);
    });
  }

  public getValidPluginInterfaces(): PhpInterface[] {
    return (this.phpFile.interfaces || []).filter(phpInterface => {
      return this.isValidPluginInterface(phpInterface);
    });
  }

  public getValidPluginMethods(): PhpMethod[] {
    const validClasslike = [...this.getValidPluginClasses(), ...this.getValidPluginInterfaces()];

    return validClasslike.flatMap(phpClass => {
      return phpClass.methods.filter(phpMethod => {
        return this.isValidPluginMethod(phpMethod);
      });
    });
  }
}
