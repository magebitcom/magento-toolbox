import { defineIndexer } from 'indexer/IndexerDefinition';
import PageLayoutIndexer from './PageLayoutIndexer';
import { PageLayoutIndexData } from './PageLayoutIndexData';

export default defineIndexer({
  key: PageLayoutIndexer.KEY,
  createIndexer: () => new PageLayoutIndexer(),
  createData: raw => new PageLayoutIndexData(raw),
});
