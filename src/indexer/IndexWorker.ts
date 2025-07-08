import { Indexer } from './Indexer';
import DiIndexer from './di/DiIndexer';
import ModuleIndexer from './module/ModuleIndexer';
import AutoloadNamespaceIndexer from './autoload-namespace/AutoloadNamespaceIndexer';
import EventsIndexer from './events/EventsIndexer';
import AclIndexer from './acl/AclIndexer';
import TemplateIndexer from './template/TemplateIndexer';
import CronIndexer from './cron/CronIndexer';

export interface WorkerMessage {
  type: 'batch';
  indexerId: string;
  files: string[];
  workspaceUri: string;
}

export interface WorkerResult {
  success: boolean;
  indexData: { [filePath: string]: any };
  error?: string;
}

// Map of indexer IDs to their classes
const indexerMap = {
  [DiIndexer.KEY]: DiIndexer,
  [ModuleIndexer.KEY]: ModuleIndexer,
  [AutoloadNamespaceIndexer.KEY]: AutoloadNamespaceIndexer,
  [EventsIndexer.KEY]: EventsIndexer,
  [AclIndexer.KEY]: AclIndexer,
  [TemplateIndexer.KEY]: TemplateIndexer,
  [CronIndexer.KEY]: CronIndexer,
};

async function processBatch(message: WorkerMessage): Promise<WorkerResult> {
  try {
    const IndexerClass = indexerMap[message.indexerId as keyof typeof indexerMap];

    if (!IndexerClass) {
      throw new Error(`Unknown indexer: ${message.indexerId}`);
    }

    const indexer: Indexer = new IndexerClass();
    const indexData: { [filePath: string]: any } = {};

    console.log(
      `WORKER: Processing batch of ${message.files.length} files for ${indexer.getName()}`
    );

    for (const filePath of message.files) {
      try {
        const data = await indexer.indexFile(filePath);

        if (data !== undefined) {
          indexData[filePath] = data;
        }
      } catch (error) {
        console.error('WORKER: Error indexing file', filePath, String(error));
      }
    }

    return {
      success: true,
      indexData,
    };
  } catch (error) {
    return {
      success: false,
      indexData: {},
      error: String(error),
    };
  }
}

// Handle messages from the main thread (child process)
if (process.send) {
  process.on('message', async (message: WorkerMessage) => {
    if (message.type === 'batch') {
      const result = await processBatch(message);
      process.send!(result);
    }
  });
}
