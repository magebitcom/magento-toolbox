import { defineIndexer } from 'indexer/IndexerDefinition';
import TemplateIndexer from './TemplateIndexer';
import { TemplateIndexData } from './TemplateIndexData';

export default defineIndexer({
  key: TemplateIndexer.KEY,
  createIndexer: () => new TemplateIndexer(),
  createData: raw => new TemplateIndexData(raw),
});
