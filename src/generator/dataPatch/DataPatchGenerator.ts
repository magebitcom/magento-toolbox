import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { DataPatchWizardData } from 'wizard/DataPatchWizard';
import Magento from 'util/Magento';
import * as fs from 'fs';
import * as path from 'path';

export default class DataPatchGenerator extends FileGenerator {
  private static readonly DATA_PATCH_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\DataPatchInterface';
  private static readonly PATCH_REVERTABLE_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\PatchRevertableInterface';

  public constructor(protected data: DataPatchWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const [vendor, module] = this.data.module.split('_');
    const setupDir = 'Setup/Patch/Data';
    const namespaceParts = [vendor, module, 'Setup', 'Patch', 'Data'];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    // Create setup directory if it doesn't exist
    const setupDirPath = path.join(moduleDirectory.fsPath, setupDir);
    if (!fs.existsSync(setupDirPath)) {
      fs.mkdirSync(setupDirPath, { recursive: true });
    }

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);

    if (header) {
      phpFile.addComment(header);
    }

    const namespace = phpFile.addNamespace(PhpNamespace.fromParts(namespaceParts).toString());
    namespace.addUse(DataPatchGenerator.DATA_PATCH_INTERFACE);

    if (this.data.revertable) {
      namespace.addUse(DataPatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const patchClass = namespace.addClass(this.data.className);
    patchClass.addImplement(DataPatchGenerator.DATA_PATCH_INTERFACE);

    if (this.data.revertable) {
      patchClass.addImplement(DataPatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    // Add apply method
    const applyMethod = patchClass.addMethod('apply');
    applyMethod.addComment('@inheritdoc');
    applyMethod.setReturnType('self');
    applyMethod.setBody('// TODO: Implement apply() method.\n\nreturn $this;');

    // Add revert method if revertable
    if (this.data.revertable) {
      const revertMethod = patchClass.addMethod('revert');
      revertMethod.addComment('@inheritdoc');
      revertMethod.setReturnType('void');
      revertMethod.setBody('// TODO: Implement revert() method.');
    }

    // Add getAliases method
    const getAliasesMethod = patchClass.addMethod('getAliases');
    getAliasesMethod.addComment('@inheritdoc');
    getAliasesMethod.setReturnType('array');
    getAliasesMethod.setBody('return [];');

    // Add getDependencies method
    const getDependenciesMethod = patchClass.addMethod('getDependencies');
    getDependenciesMethod.setStatic(true);
    getDependenciesMethod.addComment('@inheritdoc');
    getDependenciesMethod.setReturnType('array');
    getDependenciesMethod.setBody('return [];');

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, setupDir, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }
}
