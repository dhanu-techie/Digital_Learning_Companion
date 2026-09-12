import { openDB } from 'idb';

const DB_NAME = 'DigitalLearningOfflineDB';
const DB_VERSION = 1;

/**
 * Initializes IndexedDB schema with object stores for offline learning
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assessments')) {
        db.createObjectStore('assessments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('attempts')) {
        db.createObjectStore('attempts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('doubts')) {
        db.createObjectStore('doubts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'operationId' });
      }
    },
  });
}

// Client Storage Repositories
export const offlineStorage = {
  async saveCourse(course) {
    const db = await initDB();
    await db.put('courses', course);
  },

  async getCourses() {
    const db = await initDB();
    return db.getAll('courses');
  },

  async getCourseById(id) {
    const db = await initDB();
    return db.get('courses', id);
  },

  async saveLesson(lesson) {
    const db = await initDB();
    await db.put('lessons', lesson);
  },

  async getLessonsByTopic(topicId) {
    const db = await initDB();
    const all = await db.getAll('lessons');
    return all.filter(l => l.topicId === topicId);
  },

  async saveAttempt(attempt) {
    const db = await initDB();
    await db.put('attempts', attempt);
  },

  async getAttempts() {
    const db = await initDB();
    return db.getAll('attempts');
  },

  async saveDoubt(doubt) {
    const db = await initDB();
    await db.put('doubts', doubt);
  },

  async getDoubts() {
    const db = await initDB();
    return db.getAll('doubts');
  },

  // Sync Queue Queueing
  async queueSyncOperation(operation) {
    const db = await initDB();
    await db.put('sync_queue', {
      operationId: operation.operationId || `op_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entityType: operation.entityType,
      entityId: operation.entityId,
      action: operation.action,
      clientTimestamp: Date.now(),
      payload: operation.payload,
      status: 'PENDING'
    });
  },

  async getPendingSyncQueue() {
    const db = await initDB();
    const all = await db.getAll('sync_queue');
    return all.filter(item => item.status === 'PENDING');
  },

  async removeSyncOperation(operationId) {
    const db = await initDB();
    await db.delete('sync_queue', operationId);
  }
};
