import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import FileGenerator from 'generator/FileGenerator';
import SystemConfigWizard, { SystemConfigWizardData } from 'wizard/SystemConfigWizard';
import SystemConfigXmlGenerator from 'generator/systemConfig/SystemConfigXmlGenerator';
import SystemConfigDefaultsGenerator from 'generator/systemConfig/SystemConfigDefaultsGenerator';
import SystemConfigAclGenerator from 'generator/systemConfig/SystemConfigAclGenerator';

export default class GenerateSystemConfigCommand extends AbstractWizardCommand<SystemConfigWizardData> {
  constructor() {
    super('magento-toolbox.generateSystemConfig');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(contextModule: string | undefined): Promise<SystemConfigWizardData> {
    return this.attachPreview(new SystemConfigWizard()).show(contextModule);
  }

  protected buildGenerators(data: SystemConfigWizardData): FileGenerator[] {
    const generators: FileGenerator[] = [new SystemConfigXmlGenerator(data)];

    if (SystemConfigWizard.hasDefaults(data)) {
      generators.push(new SystemConfigDefaultsGenerator(data));
    }

    const wantsAcl = data.generateAcl && (data.sections ?? []).some(s => s.resource?.length > 0);
    if (wantsAcl) {
      generators.push(new SystemConfigAclGenerator(data));
    }

    return generators;
  }
}
