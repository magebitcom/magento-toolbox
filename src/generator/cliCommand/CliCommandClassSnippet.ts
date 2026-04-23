import CliCommandClassGenerator from './CliCommandClassGenerator';
import FileGenerator from 'generator/FileGenerator';
import { Snippet } from 'generator/Snippet';
import { CliCommandWizardData } from 'wizard/CliCommandWizard';

export default class CliCommandClassSnippet implements Snippet<CliCommandWizardData> {
  public readonly id = 'cliCommand.class';

  public buildGenerators(data: CliCommandWizardData): FileGenerator[] {
    return [new CliCommandClassGenerator(data)];
  }
}
