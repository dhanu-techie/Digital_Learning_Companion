# Express JS REST API Specification

This document details the REST API specifications for the **Digital & Smart Learning Platform** backend built with Node.js and Express.js.

---

## Architecture Principles

1. **API Base Path**: `/api/v1`
2. **Format**: JSON requests and responses (`Content-Type: application/json`).
3. **Authentication**: Bearer JWT (Access Token in `Authorization` header, Refresh Token in httpOnly Cookie).
4. **Idempotency**: Requests mutating state from offline sync operations must supply an `X-Idempotency-Key` or `operationId` in the body.
5. **Standard Response Format**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "error": null,
  "timestamp": "2026-09-02T19:10:00Z"
}
```

---

## Route Definitions

### 1. Authentication & Identity (`/api/v1/auth`)

- **`POST /api/v1/auth/register`**
  - **Body**: `{ username, password, role, firstName, lastName, grade, schoolCode, email, phone }`
  - **Returns**: User object & tokens.

- **`POST /api/v1/auth/login`**
  - **Body**: `{ username, password }`
  - **Returns**: `{ user, accessToken, refreshToken }`

- **`POST /api/v1/auth/refresh`**
  - **Body**: `{ refreshToken }`
  - **Returns**: `{ accessToken }`

- **`POST /api/v1/auth/logout`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Action**: Invalidates active refresh token.

---

### 2. Offline Data Synchronization (`/api/v1/sync`)

- **`POST /api/v1/sync/push`**
  - **Description**: Upload batch of client-side offline queued operations.
  - **Body**:
  ```json
  {
    "operations": [
      {
        "operationId": "op-uuid-1234",
        "entityType": "assessment_attempt",
        "entityId": "att-567",
        "action": "SUBMIT",
        "timestamp": "2026-09-02T18:00:00Z",
        "payload": {
          "assessmentId": "asm-1",
          "scoreObtained": 85.0,
          "answers": [...]
        }
      }
    ]
  }
  ```
  - **Response**: `{ processedCount: 1, failedCount: 0, operationResults: [{ operationId: "op-uuid-1234", status: "success" }] }`

- **`GET /api/v1/sync/pull`**
  - **Query Params**: `?lastSyncedAt=2026-09-01T00:00:00Z`
  - **Description**: Download modified course metadata, new assignments, and doubts since last sync.
  - **Returns**: Changed entities array for updating local IndexedDB.

---

### 3. Students & Personalized Learning (`/api/v1/students`)

- **`GET /api/v1/students/me`**
  - **Returns**: Complete student profile, current grade, streak count, learning preferences.

- **`GET /api/v1/students/me/progress`**
  - **Returns**: Course completion percentages, topic mastery scores, weak topics list.

- **`GET /api/v1/students/me/recommendations`**
  - **Returns**: Active recommendations (e.g., remedial lessons, visual concept refresher, practice sets).

- **`POST /api/v1/students/me/preferences`**
  - **Body**: `{ preferredMode: "visual", preferredLessonDurationMinutes: 15, languageCode: "ta" }`

---

### 4. Courses & Downloads (`/api/v1/courses`)

- **`GET /api/v1/courses`**
  - **Query Params**: `?grade=8&subject=math`
  - **Returns**: List of active courses with versions and lesson counts.

- **`GET /api/v1/courses/:id`**
  - **Returns**: Full course breakdown (Chapters -> Topics -> Lessons).

- **`GET /api/v1/courses/:id/download-package`**
  - **Description**: Bundled package containing text, compressed media, and question bank for offline storage.

---

### 5. Assessments (`/api/v1/assessments`)

- **`GET /api/v1/assessments`**
  - **Returns**: Available diagnostic, chapter, and practice tests.

- **`POST /api/v1/assessments/:id/start`**
  - **Returns**: Assessment attempt token, questions list (without answers).

- **`POST /api/v1/assessments/:id/submit`**
  - **Body**: `{ attemptId, answers: [{ questionId, givenAnswer, timeTakenSeconds }], isCompletedOffline: true }`
  - **Returns**: Detailed evaluation, total score, conceptual weakness diagnosis.

---

### 6. Teacher-Student In-App Doubts (`/api/v1/doubts`)

- **`POST /api/v1/doubts`**
  - **Description**: Submit a question to assigned teacher (No phone number shared).
  - **Body**: `{ subjectId, topicId, title, messageText, voiceNoteUrl }`

- **`GET /api/v1/doubts`**
  - **Returns**: List of active and resolved doubt threads.

- **`POST /api/v1/doubts/:id/reply`**
  - **Body**: `{ messageText, attachmentUrl, voiceNoteUrl }`

---

### 7. Teacher Portal & Interventions (`/api/v1/teacher`)

- **`GET /api/v1/teacher/dashboard`**
  - **Returns**: Actionable metrics (students struggling in specific topics, pending doubts, unassigned remedial tasks).

- **`GET /api/v1/teacher/students-needing-help`**
  - **Returns**: Flagged students with topic mastery < 50% and attempt count >= 2.

- **`POST /api/v1/teacher/availability`**
  - **Body**: `{ isAvailableForDoubts: true, doubtStartTime: "16:00", doubtEndTime: "19:00", maxDoubtsPerDay: 15 }`
