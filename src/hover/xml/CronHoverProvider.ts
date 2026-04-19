import { Hover, Range } from 'vscode';
import { CombinedCondition, XmlSuggestionProvider } from 'common/xml/XmlSuggestionProvider';
import { ElementNameMatches } from 'common/xml/suggestion/condition/ElementNameMatches';
import cronstrue from 'cronstrue';
import HoverBuilder from 'hover/HoverBuilder';

export class CronHoverProvider extends XmlSuggestionProvider<Hover> {
  public getElementContentMatches(): CombinedCondition[] {
    return [[new ElementNameMatches('schedule')]];
  }

  public getConfigKey(): string | undefined {
    return 'provideXmlHovers';
  }

  public getFilePatterns(): string[] {
    return ['**/etc/crontab.xml'];
  }

  public getSuggestionItems(value: string, range: Range): Hover[] {
    const readable = cronstrue.toString(value);

    if (!readable) {
      return [];
    }

    return [HoverBuilder.create().title('Cron', readable).build(range)];
  }
}
