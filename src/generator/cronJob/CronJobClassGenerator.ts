import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { CronJobWizardData } from 'wizard/CronJobWizard';
import Magento from 'util/Magento';
import * as fs from 'fs';
import * as path from 'path';

export default class CronJobClassGenerator extends FileGenerator {
  public constructor(protected data: CronJobWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const cronDir = 'Cron';
    const namespaceParts = [vendor, module, 'Cron'];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    // Create cron directory if it doesn't exist
    const cronDirPath = path.join(moduleDirectory.fsPath, cronDir);
    if (!fs.existsSync(cronDirPath)) {
      fs.mkdirSync(cronDirPath, { recursive: true });
    }

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);

    if (header) {
      phpFile.addComment(header);
    }

    const namespace = phpFile.addNamespace(PhpNamespace.fromParts(namespaceParts).toString());

    const cronClass = namespace.addClass(this.data.className);

    // Add execute method
    const executeMethod = cronClass.addMethod('execute');
    executeMethod.addComment('Execute the cron');
    executeMethod.addComment('\n@return void');
    executeMethod.setReturnType('void');
    executeMethod.setBody('// TODO: Implement execute() method.');

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, cronDir, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
