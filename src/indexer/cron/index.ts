import { defineIndexer } from 'indexer/IndexerDefinition';
import CronIndexer from './CronIndexer';
import { CronIndexData } from './CronIndexData';

export default defineIndexer({
  key: CronIndexer.KEY,
  createIndexer: () => new CronIndexer(),
  createData: raw => new CronIndexData(raw),
});
