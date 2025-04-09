import { Memoize } from 'typescript-memoize';
import { Job } from './types';
import { AbstractIndexData } from 'indexer/AbstractIndexData';
import CronIndexer from './CronIndexer';

export class CronIndexData extends AbstractIndexData<Job[]> {
  @Memoize({
    tags: [CronIndexer.KEY],
  })
  public getJobs(): Job[] {
    return this.getValues().flatMap(data => data);
  }

  public findJobByName(group: string, name: string): Job | undefined {
    return this.getJobs().find(job => job.group === group && job.name === name);
  }

  public findJobsByGroup(group: string): Job[] {
    return this.getJobs().filter(job => job.group === group);
  }

  public findJobsByInstance(instance: string): Job[] {
    return this.getJobs().filter(job => job.instance === instance);
  }
}
