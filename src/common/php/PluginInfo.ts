import { PhpClass } from 'parser/php/PhpClass';
import { PhpFile } from 'parser/php/PhpFile';
import { PhpMethod } from 'parser/php/PhpMethod';
import Magento from 'util/Magento';

export default class PluginInfo {
  constructor(private readonly phpFile: PhpFile) {}

  public getPluginMethods(phpClass: PhpClass): PhpMethod[] {
    return phpClass.methods.filter(method => Magento.isPluginMethod(method.name));
  }
}
