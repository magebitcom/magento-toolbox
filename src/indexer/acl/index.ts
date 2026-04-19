import { defineIndexer } from 'indexer/IndexerDefinition';
import AclIndexer from './AclIndexer';
import { AclIndexData } from './AclIndexData';

export default defineIndexer({
  key: AclIndexer.KEY,
  createIndexer: () => new AclIndexer(),
  createData: raw => new AclIndexData(raw),
});
