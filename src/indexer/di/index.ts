import { defineIndexer } from 'indexer/IndexerDefinition';
import DiIndexer from './DiIndexer';
import { DiIndexData } from './DiIndexData';

export default defineIndexer({
  key: DiIndexer.KEY,
  createIndexer: () => new DiIndexer(),
  createData: raw => new DiIndexData(raw),
});
