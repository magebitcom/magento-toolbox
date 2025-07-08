import { XMLParser } from 'fast-xml-parser';
import { get } from 'lodash-es';
import { Job } from './types';
import { Indexer } from 'indexer/Indexer';
import { IndexerKey } from 'types/indexer';
import * as fs from 'fs';

export default class CronIndexer extends Indexer<Job[]> {
  public static readonly KEY = 'cron';

  protected xmlParser: XMLParser;

  public constructor() {
    super();

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (_name, jpath) => {
        return ['config.group', 'config.group.job'].includes(jpath);
      },
    });
  }

  public getVersion(): number {
    return 2;
  }

  public getId(): IndexerKey {
    return CronIndexer.KEY;
  }

  public getName(): string {
    return 'crontab.xml';
  }

  public getPattern(): string {
    return '**/etc/crontab.xml';
  }

  public async indexFile(path: string): Promise<Job[]> {
    const xml = await fs.promises.readFile(path, 'utf8');
    const parsed = this.xmlParser.parse(xml);
    const config = get(parsed, 'config', {});

    const data: Job[] = [];

    // Index groups
    const groups = get(config, 'group', []);

    for (const group of groups) {
      const jobs = get(group, 'job', []);

      for (const job of jobs) {
        data.push({
          name: job['@_name'],
          instance: job['@_instance'],
          method: job['@_method'],
          schedule: job['schedule'],
          config_path: job['config_path'],
          path,
          group: group['@_id'],
        });
      }
    }

    return data;
  }
}
