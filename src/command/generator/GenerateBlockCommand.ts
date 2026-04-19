import { AbstractWizardCommand } from '../AbstractWizardCommand';
import BlockClassSnippet from 'generator/block/BlockClassSnippet';
import BlockWizard, { BlockWizardData } from 'wizard/BlockWizard';
import FileGenerator from 'generator/FileGenerator';
import { composeSnippets } from 'generator/Snippet';

export default class GenerateBlockCommand extends AbstractWizardCommand<BlockWizardData> {
  constructor() {
    super('magento-toolbox.generateBlock');
  }

  protected showWizard(contextModule: string | undefined): Promise<BlockWizardData> {
    return new BlockWizard().show(contextModule);
  }

  protected buildGenerators(data: BlockWizardData): FileGenerator[] {
    return composeSnippets([new BlockClassSnippet()], data);
  }
}
