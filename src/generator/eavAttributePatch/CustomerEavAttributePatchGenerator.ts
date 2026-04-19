import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import GeneratedFile from 'generator/GeneratedFile';
import FileGenerator from 'generator/FileGenerator';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { CustomerEavAttributePatchWizardData } from 'wizard/eavAttributePatch/CustomerEavAttributePatchWizard';
import Magento from 'util/Magento';

export default class CustomerEavAttributePatchGenerator extends FileGenerator {
  private static readonly DATA_PATCH_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\DataPatchInterface';
  private static readonly PATCH_REVERTABLE_INTERFACE =
    'Magento\\Framework\\Setup\\Patch\\PatchRevertableInterface';
  private static readonly MODULE_DATA_SETUP = 'Magento\\Framework\\Setup\\ModuleDataSetupInterface';
  private static readonly CUSTOMER_SETUP = 'Magento\\Customer\\Setup\\CustomerSetup';
  private static readonly CUSTOMER_SETUP_FACTORY = 'Magento\\Customer\\Setup\\CustomerSetupFactory';
  private static readonly CUSTOMER_CLASS = 'Magento\\Customer\\Model\\Customer';

  public constructor(protected data: CustomerEavAttributePatchWizardData) {
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
    ns.addUse(CustomerEavAttributePatchGenerator.CUSTOMER_CLASS);
    ns.addUse(CustomerEavAttributePatchGenerator.CUSTOMER_SETUP);
    ns.addUse(CustomerEavAttributePatchGenerator.CUSTOMER_SETUP_FACTORY);
    ns.addUse(CustomerEavAttributePatchGenerator.MODULE_DATA_SETUP);
    ns.addUse(CustomerEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      ns.addUse(CustomerEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const patchClass = ns.addClass(this.data.className);
    patchClass.addImplement(CustomerEavAttributePatchGenerator.DATA_PATCH_INTERFACE);
    if (this.data.revertable) {
      patchClass.addImplement(CustomerEavAttributePatchGenerator.PATCH_REVERTABLE_INTERFACE);
    }

    const ctor = patchClass.addMethod('__construct');
    ctor
      .addPromotedParameter('moduleDataSetup')
      .setType(CustomerEavAttributePatchGenerator.MODULE_DATA_SETUP)
      .setPrivate();
    ctor
      .addPromotedParameter('customerSetupFactory')
      .setType(CustomerEavAttributePatchGenerator.CUSTOMER_SETUP_FACTORY)
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
    const formsPhp = `[${this.data.usedInForms.map(f => `'${f}'`).join(', ')}]`;

    const lines = [
      '/** @var CustomerSetup $customerSetup */',
      "$customerSetup = $this->customerSetupFactory->create(['setup' => $this->moduleDataSetup]);",
      '',
      '$customerSetup->addAttribute(',
      '    Customer::ENTITY,',
      `    '${this.data.attributeCode}',`,
      '    [',
      `        'type' => '${this.data.attributeType}',`,
      `        'label' => '${this.escape(this.data.attributeLabel)}',`,
      `        'input' => '${this.data.attributeInput}',`,
      `        'required' => ${this.data.required ? 'true' : 'false'},`,
      "        'visible' => true,",
      `        'user_defined' => ${this.data.userDefined ? 'true' : 'false'},`,
      `        'sort_order' => ${sortOrder},`,
      `        'position' => ${sortOrder},`,
      "        'system' => 0,",
      '    ]',
      ');',
      '',
      `$attribute = $customerSetup->getEavConfig()->getAttribute(Customer::ENTITY, '${this.data.attributeCode}');`,
      '$attribute->addData([',
      `    'used_in_forms' => ${formsPhp},`,
      ']);',
      '$attribute->save();',
      '',
      'return $this;',
    ];
    return lines.join('\n');
  }

  private buildRevertBody(): string {
    return [
      '/** @var CustomerSetup $customerSetup */',
      "$customerSetup = $this->customerSetupFactory->create(['setup' => $this->moduleDataSetup]);",
      `$customerSetup->removeAttribute(Customer::ENTITY, '${this.data.attributeCode}');`,
    ].join('\n');
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}
