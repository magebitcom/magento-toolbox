import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { ProductEavAttributePatchWizardData } from 'wizard/eavAttributePatch/ProductEavAttributePatchWizard';
import Magento from 'util/Magento';

export default class ProductEavAttributePatchGenerator extends FileGenerator {
  private static readonly DATA_PATCH_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\DataPatchInterface';
  private static readonly PATCH_REVERTABLE_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\PatchRevertableInterface';
  private static readonly MODULE_DATA_SETUP = 'Magento\\Framework\\Setup\\ModuleDataSetupInterface';
  private static readonly EAV_SETUP = 'Magento\\Eav\\Setup\\EavSetup';
  private static readonly EAV_SETUP_FACTORY = 'Magento\\Eav\\Setup\\EavSetupFactory';
  private static readonly PRODUCT_CLASS = 'Magento\\Catalog\\Model\\Product';
  private static readonly SCOPED_ATTRIBUTE_INTERFACE =
    'Magento\\Eav\\Model\\Entity\\Attribute\\ScopedAttributeInterface';

  public constructor(protected data: ProductEavAttributePatchWizardData) {
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
    ns.addUse(ProductEavAttributePatchGenerator.PRODUCT_CLASS);
    ns.addUse(ProductEavAttributePatchGenerator.SCOPED_ATTRIBUTE_INTERFACE);
    ns.addUse(ProductEavAttributePatchGenerator.EAV_SETUP);
    ns.addUse(ProductEavAttributePatchGenerator.EAV_SETUP_FACTORY);
    ns.addUse(ProductEavAttributePatchGenerator.MODULE_DATA_SETUP);
    ns.addUse(ProductEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      ns.addUse(ProductEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const patchClass = ns.addClass(this.data.className);
    patchClass.addImplement(ProductEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      patchClass.addImplement(ProductEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const ctor = patchClass.addMethod('__construct');
    ctor
      .addPromotedParameter('moduleDataSetup')
      .setType(ProductEavAttributePatchGenerator.MODULE_DATA_SETUP)
      .setPrivate();
    ctor
      .addPromotedParameter('eavSetupFactory')
      .setType(ProductEavAttributePatchGenerator.EAV_SETUP_FACTORY)
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
      '    Product::ENTITY,',
      `    '${this.data.attributeCode}',`,
      '    [',
      `        'type' => '${this.data.attributeType}',`,
      `        'label' => '${this.escape(this.data.attributeLabel)}',`,
      `        'input' => '${this.data.attributeInput}',`,
      `        'required' => ${this.data.required ? 'true' : 'false'},`,
      `        'sort_order' => ${sortOrder},`,
      `        'global' => ScopedAttributeInterface::${this.data.scope},`,
      `        'group' => '${this.escape(this.data.group)}',`,
      `        'used_in_product_listing' => ${this.data.usedInProductListing ? 'true' : 'false'},`,
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
      `$eavSetup->removeAttribute(Product::ENTITY, '${this.data.attributeCode}');`,
    ].join('\n');
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}
