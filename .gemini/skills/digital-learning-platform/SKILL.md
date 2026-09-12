---
name: digital-learning-platform
description: Comprehensive architecture, design patterns, database schemas (MySQL), offline-first sync protocols (IndexedDB), security rules, and code generation guidelines for building a production-ready Digital & Smart Learning Platform for rural and low-connectivity areas using React JS, Tailwind CSS, Express JS, and MySQL.
---

# Digital & Smart Learning Platform Skill

## Overview

This skill provides full-stack architectural guidance, domain models, database schemas, offline-first synchronization protocols, safety layers, and component structures for building a **production-grade Digital & Smart Learning Platform**.

The platform is designed primarily for students in rural and low-connectivity areas, adhering strictly to the core principle:

> **"Learning should never stop because the internet stopped."**

---

## Tech Stack Guidelines

- **Frontend**: React JS + Vanilla Tailwind CSS (layered architecture: `components`, `pages`, `features`, `hooks`, `services`, `offline`, `sync`, `auth`).
- **Backend**: Express.js / Node.js + MySQL (layered architecture: API Gateway/Middleware -> Controllers -> Services -> Repositories -> MySQL Connection Pool).
- **Client Storage**: Browser IndexedDB (`idb` or `Dexie.js` wrapper) with Repository Abstraction.
- **Offline Sync**: Custom idempotent sync queue (`operationId`, `entityType`, `payload`, `timestamp`).
- **Mobile Support**: Web application optimized for low-end Android browsers, low RAM, and touch interfaces.

---

## Related References

The following detailed technical blueprints are packaged with this skill:

- [MySQL Schema Reference](file:///Users/sathyanathmasthan/Documents/WorkSpace/Digital_Learning/.agents/skills/digital-learning-platform/references/mysql_schema.sql) - Complete DDL with 35 tables, foreign keys, and indexes.
- [REST API Routes Specification](file:///Users/sathyanathmasthan/Documents/WorkSpace/Digital_Learning/.agents/skills/digital-learning-platform/references/api_routes.md) - Express JS endpoint signatures for Auth, Students, Courses, Assessments, Doubts, and Sync.
- [Offline Sync Engine Spec](file:///Users/sathyanathmasthan/Documents/WorkSpace/Digital_Learning/.agents/skills/digital-learning-platform/references/offline_sync_engine.md) - IndexedDB schemas, sync queue state machine, and connectivity mode handlers.

---

## Core Product Principles & Rules

### 1. Offline-First Architecture
Never make the UI directly dependent on live API responses.
- The UI MUST read from and write to the client-side **IndexedDB repository** first.
- The application MUST perform complete learning workflows offline:
  ```text
  Open App → Access Downloaded Course → Read/Watch Lessons → Complete Practice 
    → Take Assessment → Score Saved Locally → Close App → Return Later 
    → Connect Internet → Idempotent Background Sync
  ```
- Fake offline support (e.g. simple page caching or static HTML display) is **STRICTLY PROHIBITED**.

### 2. Primary User Roles & Permissions Matrix
1. **Student**: Download courses, learn offline, solve questions, take tests offline, ask doubts, view personalized recommendations and streaks.
2. **Teacher**: Manage assigned classes, review submissions, identify struggling students, answer doubts, schedule tests, configure doubt availability.
3. **Parent / Guardian**: View child progress, test performance, attendance, teacher feedback. Restricted from private teacher-student doubt conversations.
4. **School Administrator**: Manage classes, assign teachers/students, configure academic years, monitor school-wide performance.
5. **Super Admin**: Manage organizations, schools, global curriculum, subscriptions, platform feature flags, audit logs.

### 3. Privacy & Safety Layer
- **CRITICAL**: Teacher personal phone numbers and emails MUST NEVER be exposed to students.
- All teacher-student interactions MUST happen through the internal In-App Doubt system (`POST /api/v1/doubts`).
- Teacher availability is controlled via consent settings (`is_available_for_doubts`, `doubt_start_time`, `doubt_end_time`, `max_doubts_per_day`).
- Full audit logging for sensitive actions (data access, class changes, doubt responses).

---

## Frontend Architecture (React JS + Tailwind CSS)

### Directory Structure
```text
src/
├── assets/             # Icons, logos, fallback placeholders
├── components/         # Atomic reusable UI components (Buttons, Modals, Cards)
├── features/           # Feature-specific modules
│   ├── auth/           # Login, Register, Role Guards
│   ├── courses/        # Course Catalog, Download Manager, Lesson Viewer
│   ├── assessments/    # Test Player, Evaluation Report, Question Renderer
│   ├── doubts/         # In-App Doubt Chat, Audio Recorder
│   ├── teacher/        # Teacher Actionable Dashboard, Intervention List
│   └── student/        # Student Dashboard, Streak Counter, Remedial Banner
├── hooks/              # Custom hooks (useOffline, useSync, useAuth, useNetworkStatus)
├── services/           # Service abstraction layer
│   ├── api/            # Express REST API Client (Axios/Fetch)
│   ├── db/             # IndexedDB Repository Implementation
│   └── sync/           # Sync Engine Background Process
├── store/              # State management (Context / Zustand)
├── i18n/               # Localization strings (English, Tamil, Telugu, Hindi, etc.)
└── utils/              # Idempotency generators, date formatters, validators
```

### UX & Low-End Device Rules
- **Non-blocking Rendering**: Fast initial bundle size using React lazy loading and code splitting.
- **Friendly Offline Notifications**: Never display raw technical error messages (`503 Service Unavailable`). Show friendly messaging:
  > *"Your learning activity is saved locally. We'll synchronize it as soon as connection is available."*
- **Network Mode Adaptive UI**:
  - **Offline**: Show downloaded indicator, disable non-downloaded media streaming.
  - **Limited Connectivity**: Automatically compress payloads, prefer text over video.
  - **Online**: Background sync active.

---

## Backend Architecture (Express JS + MySQL)

### Directory Structure
```text
server/
├── src/
│   ├── config/          # Database connection pool, JWT secrets, environment
│   ├── controllers/     # HTTP Request handlers
│   ├── services/        # Business logic & recommendation engine
│   ├── repositories/    # MySQL query abstraction (Knex / Mysql2)
│   ├── middlewares/     # Auth, RBAC, Validation, Error Handler, Audit Logger
│   ├── routes/          # Express route definitions
│   └── utils/           # Logger, Idempotency validator
├── tests/               # Integration & Unit tests
└── app.js               # Express application entrypoint
```

---

## Testing & Verification Checklist

Before marking any feature as done, verify the following:

- [ ] **UI Implementation**: Responsive React + Tailwind layout verified on mobile & desktop views.
- [ ] **Database Integrity**: MySQL migration script executes cleanly and enforces foreign keys.
- [ ] **Security Enforcement**: JWT middleware and RBAC permissions checked for all routes.
- [ ] **Offline Execution**: Disconnect network (`navigator.onLine = false`) and verify:
  - Lessons & downloadable courses remain readable.
  - Tests can be completed and scored locally.
  - Submissions queue into `sync_queue`.
- [ ] **Sync Retry**: Reconnect network and verify `POST /api/v1/sync/push` flushes queue cleanly without duplicate database records.
