import FileHeader from 'common/php/FileHeader';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { CliCommandWizardData } from 'wizard/CliCommandWizard';

export default class CliCommandClassGenerator extends FileGenerator {
  private static readonly CONSOLE_COMMAND = 'Symfony\\Component\\Console\\Command\\Command';
  private static readonly INPUT_INTERFACE = 'Symfony\\Component\\Console\\Input\\InputInterface';
  private static readonly OUTPUT_INTERFACE = 'Symfony\\Component\\Console\\Output\\OutputInterface';

  public constructor(protected data: CliCommandWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const namespace = Magento.getModuleNamespace(vendor, module).append('Console', 'Command');
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);
    if (header) {
      phpFile.addComment(header);
    }

    const ns = phpFile.addNamespace(namespace.toString());
    ns.addUse(CliCommandClassGenerator.CONSOLE_COMMAND);
    ns.addUse(CliCommandClassGenerator.INPUT_INTERFACE);
    ns.addUse(CliCommandClassGenerator.OUTPUT_INTERFACE);

    const commandClass = ns.addClass(this.data.className);
    commandClass.setExtends(CliCommandClassGenerator.CONSOLE_COMMAND);

    const configure = commandClass.addMethod('configure');
    configure.setProtected();
    configure.addComment('@inheritdoc');
    configure.setReturnType('void');
    configure.setBody(this.buildConfigureBody());

    const execute = commandClass.addMethod('execute');
    execute.setProtected();
    execute.addParameter('input').setType(CliCommandClassGenerator.INPUT_INTERFACE);
    execute.addParameter('output').setType(CliCommandClassGenerator.OUTPUT_INTERFACE);
    execute.addComment('@inheritdoc');
    execute.setReturnType('int');
    execute.setBody('// TODO: Implement execute() method.\n\nreturn Command::SUCCESS;');

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, 'Console', 'Command', `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }

  private buildConfigureBody(): string {
    const lines = [
      `$this->setName('${this.data.commandName}');`,
      `$this->setDescription('${this.data.description.replace(/'/g, "\\'")}');`,
      'parent::configure();',
    ];
    return lines.join('\n');
  }
}
