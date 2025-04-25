import { workspace } from 'vscode';

class Config {
  public readonly SECTION = 'magento-toolbox';

  public get<T = string>(key: string, defaultValue: T): T {
    return workspace.getConfiguration(this.SECTION).get<T>(key, defaultValue);
  }
}

export default new Config();
