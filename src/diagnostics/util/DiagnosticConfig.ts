import { workspace } from 'vscode';

export type DiagnosticKey =
  | 'observerDeclaration'
  | 'pluginDeclaration'
  | 'aclResource'
  | 'cacheableFalseInDefaultLayout'
  | 'moduleDeclaration'
  | 'moduleScope'
  | 'pluginAttrType'
  | 'preferenceDeclaration'
  | 'invalidDiType'
  | 'invalidVirtualTypeSource'
  | 'webApiService';

export default class DiagnosticConfig {
  public static isEnabled(key: DiagnosticKey): boolean {
    return workspace.getConfiguration('magento-toolbox').get<boolean>(`diagnostics.${key}`, true);
  }
}
