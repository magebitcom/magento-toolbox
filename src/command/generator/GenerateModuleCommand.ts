import { AbstractWizardCommand } from '../AbstractWizardCommand';
import ModuleXmlGenerator from 'generator/module/ModuleXmlGenerator';
import ModuleRegistrationGenerator from 'generator/module/ModuleRegistrationGenerator';
import ModuleComposerGenerator from 'generator/module/ModuleComposerGenerator';
import ModuleLicenseGenerator from 'generator/module/ModuleLicenseGenerator';
import ModuleWizard, { ModuleWizardComposerData, ModuleWizardData } from 'wizard/ModuleWizard';
import FileGenerator from 'generator/FileGenerator';

type ModuleData = ModuleWizardData | ModuleWizardComposerData;

export default class GenerateModuleCommand extends AbstractWizardCommand<ModuleData> {
  constructor() {
    super('magento-toolbox.generateModule');
  }

  protected showWizard(): Promise<ModuleData> {
    return new ModuleWizard().show();
  }

  protected buildGenerators(data: ModuleData): FileGenerator[] {
    const generators: FileGenerator[] = [
      new ModuleXmlGenerator(data),
      new ModuleRegistrationGenerator(data),
    ];

    if (data.composer) {
      generators.push(new ModuleComposerGenerator(data));
    }

    if (data.license) {
      generators.push(new ModuleLicenseGenerator(data));
    }

    return generators;
  }
}
