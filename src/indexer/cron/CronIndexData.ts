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
}
