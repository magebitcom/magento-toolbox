import { fork } from 'child_process';
import { Uri } from 'vscode';
import { Indexer } from './Indexer';
import { WorkerMessage, WorkerResult } from './IndexWorker';
import Logger from 'util/Logger';
import * as path from 'path';

export class IndexWorkerManager {
  private static workerPath: string;

  static {
    // Path to the compiled worker script
    this.workerPath = path.join(__dirname, 'indexer', 'IndexWorker.js');
  }

  public async processBatch(
    indexer: Indexer,
    files: Uri[],
    workspaceUri: Uri
  ): Promise<Map<string, any>> {
    return new Promise(async (resolve, reject) => {
      try {
        const worker = fork(IndexWorkerManager.workerPath, [], {
          stdio: 'pipe',
          execArgv: [],
        });

        const message: WorkerMessage = {
          type: 'batch',
          indexerId: indexer.getId(),
          files: files.map(f => f.fsPath),
          workspaceUri: workspaceUri.fsPath,
        };

        let responseReceived = false;
        const timeout = setTimeout(() => {
          if (!responseReceived) {
            worker.kill();
            reject(new Error('Worker timeout'));
          }
        }, 10000);

        worker.on('message', (result: WorkerResult) => {
          responseReceived = true;
          clearTimeout(timeout);

          if (result.success) {
            const indexData = new Map<string, any>();
            Object.entries(result.indexData).forEach(([filePath, data]) => {
              indexData.set(filePath, data);
            });
            resolve(indexData);
          } else {
            reject(new Error(result.error || 'Unknown worker error'));
          }

          worker.kill();
        });

        worker.on('error', (error: Error) => {
          responseReceived = true;
          clearTimeout(timeout);
          Logger.error('WORKER_MANAGER', 'Worker error:', error.message);
          reject(error);
        });

        worker.on('exit', (code: number | null) => {
          if (!responseReceived) {
            clearTimeout(timeout);
            reject(new Error(`Worker exited with code ${code}`));
          }
        });

        // Send the message to the worker
        worker.send(message);
      } catch (error) {
        reject(error);
      }
    });
  }
}
