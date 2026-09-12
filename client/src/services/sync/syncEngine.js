import { offlineStorage } from '../db/indexedDB';
import apiClient from '../api/apiClient';

class SyncEngine {
  constructor() {
    this.isSyncing = false;
  }

  async processQueue() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const queue = await offlineStorage.getPendingSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[SYNC ENGINE] Processing ${queue.length} pending offline operations...`);

      const response = await apiClient.post('/sync/push', { operations: queue });

      if (response.data.success && response.data.data.operationResults) {
        for (let result of response.data.data.operationResults) {
          if (result.status === 'success' || result.status === 'already_processed') {
            await offlineStorage.removeSyncOperation(result.operationId);
          }
        }
        console.log('[SYNC ENGINE] Background sync completed successfully.');
      }
    } catch (err) {
      console.warn('[SYNC ENGINE] Background sync postponed:', err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  startAutoSyncListener() {
    window.addEventListener('online', () => {
      console.log('[SYNC ENGINE] Network restored! Triggering sync...');
      this.processQueue();
    });

    // Periodic sync check every 30 seconds
    setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, 30000);
  }
}

export const syncEngine = new SyncEngine();
