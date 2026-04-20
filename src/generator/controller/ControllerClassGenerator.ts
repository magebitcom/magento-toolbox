import FileHeader from 'common/php/FileHeader';
import PhpNamespace from 'common/PhpNamespace';
import FileGenerator from 'generator/FileGenerator';
import GeneratedFile from 'generator/GeneratedFile';
import Magento from 'util/Magento';
import { PhpFile, PsrPrinter } from 'node-php-generator';
import { Uri } from 'vscode';
import { ControllerResultType, ControllerWizardData } from 'wizard/ControllerWizard';

export default class ControllerClassGenerator extends FileGenerator {
  private static readonly FRONTEND_ACTION = 'Magento\\Framework\\App\\Action\\Action';
  private static readonly FRONTEND_CONTEXT = 'Magento\\Framework\\App\\Action\\Context';
  private static readonly ADMIN_ACTION = 'Magento\\Backend\\App\\Action';
  private static readonly ADMIN_CONTEXT = 'Magento\\Backend\\App\\Action\\Context';

  private static readonly HTTP_GET = 'Magento\\Framework\\App\\Action\\HttpGetActionInterface';
  private static readonly HTTP_POST = 'Magento\\Framework\\App\\Action\\HttpPostActionInterface';

  private static readonly PAGE_FACTORY = 'Magento\\Framework\\View\\Result\\PageFactory';
  private static readonly JSON_FACTORY = 'Magento\\Framework\\Controller\\Result\\JsonFactory';

  public constructor(protected data: ControllerWizardData) {
    super();
  }

  public async generate(workspaceUri: Uri): Promise<GeneratedFile> {
    const { vendor, module } = Magento.splitModule(this.data.module);
    const pathParts = this.data.controllerPath.split('/').filter(p => p.length > 0);
    const namespaceParts = [vendor, module, 'Controller'];
    if (this.data.area === 'adminhtml') {
      namespaceParts.push('Adminhtml');
    }
    namespaceParts.push(...pathParts);

    const moduleDirectory = Magento.getModuleDirectory(vendor, module, workspaceUri);
    const outputParts = ['Controller'];
    if (this.data.area === 'adminhtml') {
      outputParts.push('Adminhtml');
    }
    outputParts.push(...pathParts);

    const isAdmin = this.data.area === 'adminhtml';
    const actionClass = isAdmin
      ? ControllerClassGenerator.ADMIN_ACTION
      : ControllerClassGenerator.FRONTEND_ACTION;
    const contextClass = isAdmin
      ? ControllerClassGenerator.ADMIN_CONTEXT
      : ControllerClassGenerator.FRONTEND_CONTEXT;

    const phpFile = new PhpFile();
    phpFile.setStrictTypes(true);

    const header = FileHeader.getHeader(this.data.module);
    if (header) {
      phpFile.addComment(header);
    }

    const ns = phpFile.addNamespace(PhpNamespace.fromParts(namespaceParts).toString());
    ns.addUse(actionClass);
    ns.addUse(contextClass);
    const interfaces = this.collectInterfaces();
    for (const iface of interfaces) {
      ns.addUse(iface);
    }
    const factoryImport = this.factoryImport();
    if (factoryImport) {
      ns.addUse(factoryImport);
    }

    const controllerClass = ns.addClass(this.data.className);
    controllerClass.setExtends(actionClass);
    for (const iface of interfaces) {
      controllerClass.addImplement(iface);
    }
    controllerClass.addComment(this.buildRouteDocblock());

    if (isAdmin) {
      const aclConstant = controllerClass.addConstant(
        'ADMIN_RESOURCE',
        this.data.aclResource || `${vendor}_${module}::${this.data.routeId}`
      );
      aclConstant.setPublic();
    }

    const ctor = controllerClass.addMethod('__construct');
    ctor.addParameter('context').setType(contextClass);
    const factoryProperty = this.factoryPropertyName();
    const factoryType = this.factoryImport();
    if (factoryProperty && factoryType) {
      ctor.addPromotedParameter(factoryProperty).setType(factoryType).setPrivate();
    }
    ctor.setBody('parent::__construct($context);');

    const execute = controllerClass.addMethod('execute');
    execute.setBody(this.buildExecuteBody(isAdmin));

    const printer = new PsrPrinter();
    return new GeneratedFile(
      Uri.joinPath(moduleDirectory, ...outputParts, `${this.data.className}.php`),
      printer.printFile(phpFile)
    );
  }

  private collectInterfaces(): string[] {
    switch (this.data.httpMethod) {
      case 'get':
        return [ControllerClassGenerator.HTTP_GET];
      case 'post':
        return [ControllerClassGenerator.HTTP_POST];
      case 'both':
        return [ControllerClassGenerator.HTTP_GET, ControllerClassGenerator.HTTP_POST];
      case 'none':
      default:
        return [];
    }
  }

  private factoryImport(): string | null {
    switch (this.data.resultType) {
      case 'page':
        return ControllerClassGenerator.PAGE_FACTORY;
      case 'json':
        return ControllerClassGenerator.JSON_FACTORY;
      case 'redirect':
      default:
        return null;
    }
  }

  private factoryPropertyName(): string | null {
    switch (this.data.resultType) {
      case 'page':
        return 'pageFactory';
      case 'json':
        return 'jsonFactory';
      case 'redirect':
      default:
        return null;
    }
  }

  private buildRouteDocblock(): string {
    const slug = (value: string) => value.toLowerCase();
    const controllerSegment = this.data.controllerPath.split('/').map(slug).join('/');
    const actionSegment = slug(this.data.className);
    if (this.data.area === 'adminhtml') {
      return `Admin route: admin/${this.data.frontName}/${controllerSegment}/${actionSegment}`;
    }
    return `Storefront route: ${this.data.frontName}/${controllerSegment}/${actionSegment}`;
  }

  private buildExecuteBody(isAdmin: boolean): string {
    switch (this.data.resultType as ControllerResultType) {
      case 'page': {
        if (isAdmin) {
          const title = humanize(this.data.className);
          return [
            '$page = $this->pageFactory->create();',
            '$page->setActiveMenu(self::ADMIN_RESOURCE);',
            `$page->getConfig()->getTitle()->prepend(__('${this.escapePhp(title)}'));`,
            '',
            'return $page;',
          ].join('\n');
        }
        return 'return $this->pageFactory->create();';
      }
      case 'json':
        return 'return $this->jsonFactory->create()->setData([]);';
      case 'redirect':
      default:
        return "return $this->resultRedirectFactory->create()->setPath('*/*/');";
    }
  }

  private escapePhp(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}

/**
 * Split CamelCase/PascalCase identifiers into space-separated words for page
 * titles. `EditCustomer` → `Edit Customer`.
 */
function humanize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();
}
