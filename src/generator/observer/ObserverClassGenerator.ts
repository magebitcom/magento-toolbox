import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import ModuleFileGenerator from 'generator/ModuleFileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { ObserverWizardData } from 'wizard/ObserverWizard';

export default class ObserverClassGenerator extends ModuleFileGenerator {
  private static readonly OBSERVER_INTERFACE = 'Magento\\Framework\\Event\\ObserverInterface';
  private static readonly OBSERVER_CLASS = 'Magento\\Framework\\Event\\Observer';

  public constructor(protected data: ObserverWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const namespaceParts = [vendor, module, this.data.directoryPath];
    const moduleDirectory = this.getModuleDirectory(vendor, module, workspaceUri);

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);

    if (header) {
      phpFile.addComment(header);
    }

    const namespace = phpFile.addNamespace(PhpNamespace.fromParts(namespaceParts).toString());
    namespace.addUse(ObserverClassGenerator.OBSERVER_INTERFACE);
    namespace.addUse(ObserverClassGenerator.OBSERVER_CLASS);

    const observerClass = namespace.addClass(this.data.className);
    observerClass.addImplement(ObserverClassGenerator.OBSERVER_INTERFACE);

    const observerMethod = observerClass.addMethod('execute');
    observerMethod.addParameter('observer').setType(ObserverClassGenerator.OBSERVER_CLASS);
    observerMethod.addComment(`Observer for "${this.data.eventName}"\n`);
    observerMethod.addComment('@param Observer $observer');
    observerMethod.addComment('@return void');
    observerMethod.setBody(`$event = $observer->getEvent();\n// TODO: Observer code`);

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, this.data.directoryPath, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
