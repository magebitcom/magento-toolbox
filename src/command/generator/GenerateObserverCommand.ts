import { AbstractWizardCommand, OpenStrategy } from '../AbstractWizardCommand';
import ObserverWizard, { ObserverWizardData } from 'wizard/ObserverWizard';
import ObserverClassGenerator from 'generator/observer/ObserverClassGenerator';
import ObserverEventsGenerator from 'generator/observer/ObserverEventsGenerator';
import FileGenerator from 'generator/FileGenerator';

export default class GenerateObserverCommand extends AbstractWizardCommand<ObserverWizardData> {
  constructor() {
    super('magento-toolbox.generateObserver');
  }

  protected openStrategy(): OpenStrategy {
    return 'all';
  }

  protected showWizard(
    contextModule: string | undefined,
    _uri: unknown,
    args: unknown[]
  ): Promise<ObserverWizardData> {
    const eventName = typeof args[0] === 'string' ? args[0] : undefined;
    return new ObserverWizard().show(eventName, contextModule);
  }

  protected buildGenerators(data: ObserverWizardData): FileGenerator[] {
    return [new ObserverClassGenerator(data), new ObserverEventsGenerator(data)];
  }
}
