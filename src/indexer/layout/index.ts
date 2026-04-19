import { defineIndexer } from 'indexer/IndexerDefinition';
import LayoutIndexer from './LayoutIndexer';
import { LayoutIndexData } from './LayoutIndexData';

export default defineIndexer({
  key: LayoutIndexer.KEY,
  createIndexer: () => new LayoutIndexer(),
  createData: raw => new LayoutIndexData(raw),
});
