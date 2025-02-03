import * as vscode from 'vscode';

export type Command = (context: vscode.ExtensionContext) => void;

export enum License {
  None = 'none',
  APACHE2 = 'apache2',
  MIT = 'mit',
  GPL_V3 = 'gplv3',
  OSL_V3 = 'oslv3',
}
