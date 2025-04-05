import { workspace } from 'vscode';

class Config {
  public readonly SECTION = 'magento-toolbox';

  public get<T = string>(key: string): T | undefined {
    return workspace.getConfiguration(this.SECTION).get<T>(key);
  }
}

export default new Config();
