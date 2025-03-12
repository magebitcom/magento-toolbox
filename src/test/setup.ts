import ExtensionState from 'common/ExtensionState';
import { extensions } from 'vscode';
import Common from 'util/Common';

export async function setup() {
  const extension = extensions.getExtension(Common.EXTENSION_ID);
  const context = await extension?.activate();

  ExtensionState.init(context, []);
}
