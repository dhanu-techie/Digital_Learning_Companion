const syncRepository = require('../repositories/syncRepository');
const assessmentService = require('./assessmentService');

class SyncService {
  async processBatchSync(operations, userId) {
    const operationResults = [];
    let processedCount = 0;
    let failedCount = 0;

    for (let op of operations) {
      const { operationId, entityType, entityId, action, clientTimestamp, payload } = op;

      // 1. Idempotency check
      const existing = await syncRepository.findOperationById(operationId);
      if (existing) {
        operationResults.push({
          operationId,
          status: 'already_processed',
          syncedAt: existing.server_synced_at
        });
        processedCount++;
        continue;
      }

      // 2. Process payload according to entity type
      try {
        if (entityType === 'assessment_attempt' && action === 'SUBMIT') {
          await assessmentService.evaluateAttempt(payload, userId, true);
        } else if (entityType === 'doubt' && action === 'CREATE') {
          await require('./doubtService').createDoubt(payload, userId);
        }

        // 3. Record operation log
        await syncRepository.recordSyncOperation({
          operationId,
          userId,
          entityType,
          entityId,
          action,
          clientTimestamp,
          status: 'success'
        });

        operationResults.push({ operationId, status: 'success' });
        processedCount++;
      } catch (err) {
        console.error(`[SYNC ERROR] Operation ${operationId} failed:`, err.message);
        await syncRepository.recordSyncOperation({
          operationId,
          userId,
          entityType,
          entityId,
          action,
          clientTimestamp,
          status: 'failed',
          errorMessage: err.message
        });

        operationResults.push({ operationId, status: 'failed', error: err.message });
        failedCount++;
      }
    }

    return {
      serverTimestamp: new Date().toISOString(),
      processedCount,
      failedCount,
      operationResults
    };
  }

  async getDeltaChanges(sinceTimestamp) {
    return syncRepository.getDeltaChanges(sinceTimestamp);
  }
}

module.exports = new SyncService();
