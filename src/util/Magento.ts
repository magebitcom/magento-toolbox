import lowerFirst from 'lodash-es/lowerFirst';

export default class Magento {
  public static isPluginMethod(method: string) {
    return /^around|^before|^after/.test(method);
  }

  public static pluginMethodToMethodName(method: string): string | undefined {
    return lowerFirst(method.replace(/^around|^before|^after/, ''));
  }
}
