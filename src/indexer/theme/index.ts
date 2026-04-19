import { defineIndexer } from 'indexer/IndexerDefinition';
import ThemeIndexer from './ThemeIndexer';
import { ThemeIndexData } from './ThemeIndexData';

export default defineIndexer({
  key: ThemeIndexer.KEY,
  createIndexer: () => new ThemeIndexer(),
  createData: raw => new ThemeIndexData(raw),
});
