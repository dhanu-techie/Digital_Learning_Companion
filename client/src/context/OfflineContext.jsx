import React, { createContext, useState, useEffect } from 'react';
import { offlineStorage } from '../services/db/indexedDB';
import { syncEngine } from '../services/sync/syncEngine';

export const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncEngine.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync engine setup
    syncEngine.startAutoSyncListener();

    // Check queue status periodically
    const interval = setInterval(async () => {
      const queue = await offlineStorage.getPendingSyncQueue();
      setPendingQueueCount(queue.length);
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    await syncEngine.processQueue();
    const queue = await offlineStorage.getPendingSyncQueue();
    setPendingQueueCount(queue.length);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingQueueCount, triggerSync }}>
      {children}
    </OfflineContext.Provider>
  );
}
