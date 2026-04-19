import { AbstractWizardCommand } from '../AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import ProductEavAttributePatchGenerator from 'generator/eavAttributePatch/ProductEavAttributePatchGenerator';
import ProductEavAttributePatchWizard, {
  ProductEavAttributePatchWizardData,
} from 'wizard/eavAttributePatch/ProductEavAttributePatchWizard';

export default class GenerateProductEavAttributePatchCommand extends AbstractWizardCommand<ProductEavAttributePatchWizardData> {
  constructor() {
    super('magento-toolbox.generateProductEavAttributePatch');
  }

  protected showWizard(
    contextModule: string | undefined
  ): Promise<ProductEavAttributePatchWizardData> {
    return this.attachPreview(new ProductEavAttributePatchWizard()).show(contextModule);
  }

  protected buildGenerators(data: ProductEavAttributePatchWizardData): FileGenerator[] {
    return [new ProductEavAttributePatchGenerator(data)];
  }
}
