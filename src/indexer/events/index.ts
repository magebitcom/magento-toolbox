import { defineIndexer } from 'indexer/IndexerDefinition';
import EventsIndexer from './EventsIndexer';
import { EventsIndexData } from './EventsIndexData';

export default defineIndexer({
  key: EventsIndexer.KEY,
  createIndexer: () => new EventsIndexer(),
  createData: raw => new EventsIndexData(raw),
});
