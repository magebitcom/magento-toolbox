import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import CliCommandClassSnippet from 'generator/cliCommand/CliCommandClassSnippet';
import CliCommandDiSnippet from 'generator/cliCommand/CliCommandDiSnippet';
import CliCommandWizard, { CliCommandWizardData } from 'wizard/CliCommandWizard';
import FileGenerator from 'generator/FileGenerator';
import { composeSnippets } from 'generator/Snippet';

export default class GenerateCliCommandCommand extends AbstractWizardCommand<CliCommandWizardData> {
  constructor() {
    super('magento-toolbox.generateCliCommand');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(contextModule: string | undefined): Promise<CliCommandWizardData> {
    return this.attachPreview(new CliCommandWizard()).show(contextModule);
  }

  protected buildGenerators(data: CliCommandWizardData): FileGenerator[] {
    return composeSnippets([new CliCommandClassSnippet(), new CliCommandDiSnippet()], data);
  }
}
