import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { CategoryEavAttributePatchWizardData } from 'wizard/eavAttributePatch/CategoryEavAttributePatchWizard';
import Magento from 'util/Magento';

export default class CategoryEavAttributePatchGenerator extends FileGenerator {
  private static readonly DATA_PATCH_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\DataPatchInterface';
  private static readonly PATCH_REVERTABLE_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\PatchRevertableInterface';
  private static readonly MODULE_DATA_SETUP = 'Magento\\Framework\\Setup\\ModuleDataSetupInterface';
  private static readonly EAV_SETUP = 'Magento\\Eav\\Setup\\EavSetup';
  private static readonly EAV_SETUP_FACTORY = 'Magento\\Eav\\Setup\\EavSetupFactory';
  private static readonly CATEGORY_CLASS = 'Magento\\Catalog\\Model\\Category';

  public constructor(protected data: CategoryEavAttributePatchWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const namespaceParts = [vendor, module, 'Setup', 'Patch', 'Data'];
    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);
    if (header) {
      phpFile.addComment(header);
    }

    const ns = phpFile.addNamespace(PhpNamespace.fromParts(namespaceParts).toString());
    ns.addUse(CategoryEavAttributePatchGenerator.CATEGORY_CLASS);
    ns.addUse(CategoryEavAttributePatchGenerator.EAV_SETUP);
    ns.addUse(CategoryEavAttributePatchGenerator.EAV_SETUP_FACTORY);
    ns.addUse(CategoryEavAttributePatchGenerator.MODULE_DATA_SETUP);
    ns.addUse(CategoryEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      ns.addUse(CategoryEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const patchClass = ns.addClass(this.data.className);
    patchClass.addImplement(CategoryEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      patchClass.addImplement(CategoryEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const ctor = patchClass.addMethod('__construct');
    ctor
      .addPromotedParameter('moduleDataSetup')
      .setType(CategoryEavAttributePatchGenerator.MODULE_DATA_SETUP)
      .setPrivate();
    ctor
      .addPromotedParameter('eavSetupFactory')
      .setType(CategoryEavAttributePatchGenerator.EAV_SETUP_FACTORY)
      .setPrivate();

    const apply = patchClass.addMethod('apply');
    apply.addComment('@inheritdoc');
    apply.setReturnType('self');
    apply.setBody(this.buildApplyBody());

    if (this.data.revertable) {
      const revert = patchClass.addMethod('revert');
      revert.addComment('@inheritdoc');
      revert.setReturnType('void');
      revert.setBody(this.buildRevertBody());
    }

    const getAliases = patchClass.addMethod('getAliases');
    getAliases.addComment('@inheritdoc');
    getAliases.setReturnType('array');
    getAliases.setBody('return [];');

    const getDependencies = patchClass.addMethod('getDependencies');
    getDependencies.setStatic(true);
    getDependencies.addComment('@inheritdoc');
    getDependencies.setReturnType('array');
    getDependencies.setBody('return [];');

    const printer = new PsrPrinter();

    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, 'Setup', 'Patch', 'Data', `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }

  private buildApplyBody(): string {
    const sortOrder = Number(this.data.sortOrder) || 100;
    const lines = [
      '/** @var EavSetup $eavSetup */',
      "$eavSetup = $this->eavSetupFactory->create(['setup' => $this->moduleDataSetup]);",
      '',
      '$eavSetup->addAttribute(',
      '    Category::ENTITY,',
      `    '${this.data.attributeCode}',`,
      '    [',
      `        'type' => '${this.data.attributeType}',`,
      `        'label' => '${this.escape(this.data.attributeLabel)}',`,
      `        'input' => '${this.data.attributeInput}',`,
      `        'required' => ${this.data.required ? 'true' : 'false'},`,
      `        'sort_order' => ${sortOrder},`,
      `        'group' => '${this.escape(this.data.group)}',`,
      "        'global' => \\Magento\\Eav\\Model\\Entity\\Attribute\\ScopedAttributeInterface::SCOPE_STORE,",
      '    ]',
      ');',
      '',
      'return $this;',
    ];
    return lines.join('\n');
  }

  private buildRevertBody(): string {
    return [
      '/** @var EavSetup $eavSetup */',
      "$eavSetup = $this->eavSetupFactory->create(['setup' => $this->moduleDataSetup]);",
      `$eavSetup->removeAttribute(Category::ENTITY, '${this.data.attributeCode}');`,
    ].join('\n');
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}
