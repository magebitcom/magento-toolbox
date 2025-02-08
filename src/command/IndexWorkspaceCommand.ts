import { Command } from 'command/Command';
import IndexRunner from 'indexer/IndexRunner';

export default class IndexWorkspaceCommand extends Command {
  constructor() {
    super('magento-toolbox.indexWorkspace');
  }

  public async execute(...args: any[]): Promise<void> {
    await IndexRunner.indexWorkspace();
  }
}
