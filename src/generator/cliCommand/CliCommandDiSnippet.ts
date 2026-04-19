import CliCommandDiGenerator from './CliCommandDiGenerator';
import FileGenerator from 'generator/FileGenerator';
import { Snippet } from 'generator/Snippet';
import { CliCommandWizardData } from 'wizard/CliCommandWizard';

export default class CliCommandDiSnippet implements Snippet<CliCommandWizardData> {
  public readonly id = 'cliCommand.di';

  public buildGenerators(data: CliCommandWizardData): FileGenerator[] {
    return [new CliCommandDiGenerator(data)];
  }
}
