# Offline-First IndexedDB & Sync Engine Architecture

This document describes the offline storage architecture and synchronization protocol for the **Digital & Smart Learning Platform** using browser IndexedDB and an idempotent sync queue.

---

## 1. Core Principle

> "Learning should never stop because the internet stopped."

All user interaction (reading lessons, watching downloaded videos, solving practice questions, taking tests, submitting assignments) is written to local storage **first**. Connectivity serves as a synchronization mechanism, not a runtime dependency.

---

## 2. Client-Side IndexedDB Schema

The browser storage is managed using IndexedDB (recommended via standard wrappers like `idb` or `Dexie.js`).

### Object Stores:

1. **`courses`**: `[id (PK), subjectId, title, version, downloadedAt]`
2. **`lessons`**: `[id (PK), topicId, title, contentType, textContent, localAssetPath, version]`
3. **`assessments`**: `[id (PK), subjectId, title, questionsJson, durationMinutes]`
4. **`assessment_attempts`**: `[id (PK), assessmentId, startedAt, completedAt, score, isSynced]`
5. **`assignments`**: `[id (PK), classId, title, description, dueDate]`
6. **`assignment_submissions`**: `[id (PK), assignmentId, text, attachmentBlob, isSynced]`
7. **`doubts`**: `[id (PK), teacherId, subjectId, title, messagesJson, isSynced]`
8. **`sync_queue`**: `[operationId (PK), entityType, entityId, action, timestamp, payload, status, retryCount]`

---

## 3. Sync Queue Architecture

Every mutating user action taken while offline or online generates a standardized `SyncOperation` stored in `sync_queue`:

```json
{
  "operationId": "op_987f6543-e21b-4567-89ab-cdef01234567",
  "entityType": "assessment_attempt",
  "entityId": "att_12345",
  "action": "SUBMIT",
  "clientTimestamp": 1788373800000,
  "payload": {
    "assessmentId": "asm_88",
    "scoreObtained": 85.0,
    "answers": [
      { "questionId": "q1", "givenAnswer": ["B"], "timeTakenSeconds": 45 }
    ]
  },
  "status": "PENDING",
  "retryCount": 0
}
```

---

## 4. Connectivity Network Modes

1. **Offline Mode**:
   - `navigator.onLine === false` or API ping fails.
   - App reads purely from IndexedDB.
   - Write operations append to `sync_queue`.
   - UI shows a visual indicator: `offline-ready` status pill.

2. **Limited Connectivity Mode**:
   - Slow/unstable cellular connection (detected via Network Information API or latency pings > 2000ms).
   - Serves text/essential UI from local IndexedDB.
   - Pushes `sync_queue` in small payload chunks (max 5 operations per payload).
   - Suppresses automatic video streaming; falls back to audio/text.

3. **Online Mode**:
   - High-speed stable connection.
   - Flushes `sync_queue` immediately.
   - Pulls content version diffs from `/api/v1/sync/pull`.

---

## 5. Synchronization Flow

```text
[User Action (e.g. Complete Test)]
              ↓
    Write to IndexedDB
              ↓
  Queue in `sync_queue` (Status: PENDING)
              ↓
      Network Listener
   (Online Event / Periodic Ping)
              ↓
   POST /api/v1/sync/push
              ↓
     Backend Validation & 
    Idempotent Processing
              ↓
   Ack Received from Backend
              ↓
 Remove from `sync_queue` 
& Mark Item `isSynced: true`
```

---

## 6. Idempotency & Conflict Resolution

- **Idempotency**: The backend checks `offline_sync_operations` table by `operationId`. If an operation with `operationId` was already processed, the backend returns success immediately without re-executing state changes.
- **Conflict Handling**:
  - **Single Student Activity (Progress, Test Attempts)**: Client timestamp & local submission prevail; server accepts client result.
  - **Multi-User Data (Doubts, Shared Assignments)**: Server merges doubt messages chronologically using ISO timestamp. If a clash occurs, server preserves both messages and appends status tag.
