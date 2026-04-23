import BlockClassGenerator from './BlockClassGenerator';
import FileGenerator from 'generator/FileGenerator';
import { Snippet } from 'generator/Snippet';
import { BlockWizardData } from 'wizard/BlockWizard';

export default class BlockClassSnippet implements Snippet<BlockWizardData> {
  public readonly id = 'block.class';

  public buildGenerators(data: BlockWizardData): FileGenerator[] {
    return [new BlockClassGenerator(data)];
  }
}
