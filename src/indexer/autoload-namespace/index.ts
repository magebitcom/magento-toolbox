import { defineIndexer } from 'indexer/IndexerDefinition';
import AutoloadNamespaceIndexer from './AutoloadNamespaceIndexer';
import { AutoloadNamespaceIndexData } from './AutoloadNamespaceIndexData';

export default defineIndexer({
  key: AutoloadNamespaceIndexer.KEY,
  createIndexer: () => new AutoloadNamespaceIndexer(),
  createData: raw => new AutoloadNamespaceIndexData(raw),
});
