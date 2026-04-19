import { defineIndexer } from 'indexer/IndexerDefinition';
import ModuleIndexer from './ModuleIndexer';
import { ModuleIndexData } from './ModuleIndexData';

export default defineIndexer({
  key: ModuleIndexer.KEY,
  createIndexer: () => new ModuleIndexer(),
  createData: raw => new ModuleIndexData(raw),
});
