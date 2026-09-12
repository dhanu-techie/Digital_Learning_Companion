import React, { useContext } from 'react';
import { OfflineContext } from '../../context/OfflineContext';
import { RefreshCw, CheckCircle2, CloudOff } from 'lucide-react';

export default function SyncStatusIndicator() {
  const { isOnline, pendingQueueCount, triggerSync } = useContext(OfflineContext);

  if (!isOnline) {
    return (
      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <CloudOff class="w-3.5 h-3.5 mr-1 text-amber-600" />
        Offline ({pendingQueueCount} queued)
      </span>
    );
  }

  if (pendingQueueCount > 0) {
    return (
      <button
        onClick={triggerSync}
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
      >
        <RefreshCw class="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
        Syncing {pendingQueueCount} items
      </button>
    );
  }

  return (
    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 class="w-3.5 h-3.5 mr-1 text-emerald-600" />
      Synced
    </span>
  );
}
