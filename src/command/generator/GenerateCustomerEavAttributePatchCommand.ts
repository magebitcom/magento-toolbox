import { AbstractWizardCommand } from '../AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import CustomerEavAttributePatchGenerator from 'generator/eavAttributePatch/CustomerEavAttributePatchGenerator';
import CustomerEavAttributePatchWizard, {
  CustomerEavAttributePatchWizardData,
} from 'wizard/eavAttributePatch/CustomerEavAttributePatchWizard';

export default class GenerateCustomerEavAttributePatchCommand extends AbstractWizardCommand<CustomerEavAttributePatchWizardData> {
  constructor() {
    super('magento-toolbox.generateCustomerEavAttributePatch');
  }

  protected showWizard(
    contextModule: string | undefined
  ): Promise<CustomerEavAttributePatchWizardData> {
    return this.attachPreview(new CustomerEavAttributePatchWizard()).show(contextModule);
  }

  protected buildGenerators(data: CustomerEavAttributePatchWizardData): FileGenerator[] {
    return [new CustomerEavAttributePatchGenerator(data)];
  }
}
