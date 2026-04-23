import { AbstractWizardCommand } from '../AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import CategoryEavAttributePatchGenerator from 'generator/eavAttributePatch/CategoryEavAttributePatchGenerator';
import CategoryEavAttributePatchWizard, {
  CategoryEavAttributePatchWizardData,
} from 'wizard/eavAttributePatch/CategoryEavAttributePatchWizard';

export default class GenerateCategoryEavAttributePatchCommand extends AbstractWizardCommand<CategoryEavAttributePatchWizardData> {
  constructor() {
    super('magento-toolbox.generateCategoryEavAttributePatch');
  }

  protected showWizard(
    contextModule: string | undefined
  ): Promise<CategoryEavAttributePatchWizardData> {
    return this.attachPreview(new CategoryEavAttributePatchWizard()).show(contextModule);
  }

  protected buildGenerators(data: CategoryEavAttributePatchWizardData): FileGenerator[] {
    return [new CategoryEavAttributePatchGenerator(data)];
  }
}
