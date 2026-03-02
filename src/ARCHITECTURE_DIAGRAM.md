# 🏗️ Hope Spot Architecture Diagram
## Visual Database & System Structure

---

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                               │
│                                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│   │   Helper     │    │   Rescuer    │    │    Admin     │            │
│   │  Dashboard   │    │  Dashboard   │    │  Dashboard   │            │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘            │
│          │                   │                   │                     │
│          └───────────────────┴───────────────────┘                     │
│                              │                                         │
│                              │ API Calls                               │
│                              ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                   BACKEND (Hono on Deno Edge Functions)                │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  API Routes (/make-server-12d090c6)                             │  │
│   │                                                                  │  │
│   │  GET  /requests     → db.helperRequests.getAll()               │  │
│   │  POST /requests     → db.helperRequests.create()               │  │
│   │  PUT  /requests/:id → db.helperRequests.update()               │  │
│   │                                                                  │  │
│   │  GET  /rescuers     → db.rescuerRegistration.getAll()          │  │
│   │  POST /rescuers     → db.rescuerRegistration.create()          │  │
│   │                                                                  │  │
│   │  POST /signup       → Supabase Auth + Create Profile           │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              │                                         │
│                              │ database.tsx                            │
│                              ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase PostgreSQL)                       │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                     HELPER DASHBOARD TABLE                     │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    helper_request_submission                       ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  badge_id (UNIQUE)                REQ-12345        ║       │   │
│  │  ║  helper_name                      VARCHAR(255)     ║       │   │
│  │  ║  phone                            VARCHAR(20)      ║       │   │
│  │  ║  location                         TEXT             ║       │   │
│  │  ║  emergency_type                   VARCHAR(100)     ║       │   │
│  │  ║  status                           VARCHAR(50)      ║       │   │
│  │  ║  assigned_rescuer_id (FK)         UUID             ║       │   │
│  │  ║  created_at                       TIMESTAMPTZ      ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                   ↓                                    │
│                      assigned_rescuer_id (FK)                          │
│                                   ↓                                    │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    RESCUER DASHBOARD TABLES                    │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    rescuer_registration                            ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  badge_id (UNIQUE)                RES-ABC123       ║       │   │
│  │  ║  auth_user_id                     UUID             ║       │   │
│  │  ║  name                             VARCHAR(255)     ║       │   │
│  │  ║  email (UNIQUE)                   VARCHAR(255)     ║       │   │
│  │  ║  phone                            VARCHAR(20)      ║       │   │
│  │  ║  skills                           TEXT[]           ║       │   │
│  │  ║  availability_status              VARCHAR(50)      ║       │   │
│  │  ║  verification_status              VARCHAR(50)      ║       │   │
│  │  ║  total_missions_completed         INTEGER          ║       │   │
│  │  ║  rating                           DECIMAL(3,2)     ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    case_assigning                                  ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  request_id (FK)                  UUID             ║       │   │
│  │  ║  rescuer_id (FK)                  UUID             ║       │   │
│  │  ║  status                           VARCHAR(50)      ║       │   │
│  │  ║  assigned_at                      TIMESTAMPTZ      ║       │   │
│  │  ║  accepted_at                      TIMESTAMPTZ      ║       │   │
│  │  ║  completion_time                  TIMESTAMPTZ      ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    case_rejection                                  ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  request_id (FK)                  UUID             ║       │   │
│  │  ║  rescuer_id (FK)                  UUID             ║       │   │
│  │  ║  rejection_reason                 TEXT             ║       │   │
│  │  ║  rejected_at                      TIMESTAMPTZ      ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                     ADMIN DASHBOARD TABLES                     │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    rescuer_directory                               ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  rescuer_id (FK, UNIQUE)          UUID             ║       │   │
│  │  ║  rescuer_badge_id                 VARCHAR(20)      ║       │   │
│  │  ║  background_check_status          VARCHAR(50)      ║       │   │
│  │  ║  training_status                  VARCHAR(50)      ║       │   │
│  │  ║  is_active                        BOOLEAN          ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  │                                                                 │   │
│  │  ╔════════════════════════════════════════════════════╗       │   │
│  │  ║    rescuer_assignment                              ║       │   │
│  │  ╠════════════════════════════════════════════════════╣       │   │
│  │  ║  id (PK)                          UUID             ║       │   │
│  │  ║  request_id (FK)                  UUID             ║       │   │
│  │  ║  rescuer_id (FK)                  UUID             ║       │   │
│  │  ║  workflow_stage                   VARCHAR(50)      ║       │   │
│  │  ║  stage_history                    JSONB            ║       │   │
│  │  ╚════════════════════════════════════════════════════╝       │   │
│  └────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Foreign Key Relationships

```
helper_request_submission
    │
    │ assigned_rescuer_id
    │
    ↓
rescuer_registration ←────────┐
    │                          │
    │ rescuer_id               │
    │                          │
    ├──→ case_assigning        │
    │       │                  │
    │       │ assignment_id    │
    │       │                  │
    │       ↓                  │
    │   case_rejection         │
    │                          │
    └──→ rescuer_directory     │
            │                  │
            └──────────────────┘
                               │
                               ↓
                    rescuer_assignment
```

---

## 🎯 Workflow State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                     REQUEST LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   PENDING   │  ← Helper submits request
    └──────┬──────┘    (helper_request_submission created)
           │
           │ Admin/System assigns rescuer
           │ (case_assigning record created)
           ↓
    ┌─────────────┐
    │  ASSIGNED   │
    └──────┬──────┘
           │
           ├───────────────────────────────────────┐
           │                                       │
           │ Rescuer accepts                       │ Rescuer rejects
           │ (case_assigning.accepted_at set)      │ (case_rejection created)
           ↓                                       ↓
    ┌─────────────┐                        ┌─────────────┐
    │  ACCEPTED   │                        │  REJECTED   │
    └──────┬──────┘                        └─────────────┘
           │
           │ Rescuer completes mission
           │ (case_assigning.completion_time set)
           │ (rescuer.total_missions_completed++)
           ↓
    ┌─────────────┐
    │  COMPLETED  │
    └─────────────┘
```

---

## 👥 Rescuer Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  RESCUER VERIFICATION                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │ User signs up│
    └──────┬───────┘
           │
           │ POST /signup
           │
           ↓
    ┌────────────────────────────┐
    │ 1. Supabase Auth User      │
    │ 2. rescuer_registration    │
    │ 3. rescuer_directory       │
    └──────┬─────────────────────┘
           │
           │ verification_status = 'Pending'
           │ background_check_status = 'Pending'
           ↓
    ┌──────────────┐
    │   PENDING    │  ← Awaiting admin review
    └──────┬───────┘
           │
           │ Admin reviews
           │
           ├───────────────────────────────────────┐
           │                                       │
           │ Admin approves                        │ Admin rejects
           │ (rescuer_directory updated)           │ (rescuer_directory updated)
           ↓                                       ↓
    ┌──────────────┐                        ┌──────────────┐
    │   VERIFIED   │                        │   REJECTED   │
    └──────────────┘                        └──────────────┘
           │
           │ Can now accept assignments
           ↓
    ┌──────────────┐
    │  AVAILABLE   │
    └──────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────┘

HELPER SUBMITS REQUEST:
┌────────────┐    POST /requests    ┌──────────────┐    INSERT    ┌─────────────────────────┐
│   Helper   │ ──────────────────> │   Backend    │ ──────────> │ helper_request_         │
│ Dashboard  │                      │   Server     │              │ submission              │
└────────────┘                      └──────────────┘              │ - badge_id: REQ-12345   │
                                                                  │ - status: Pending       │
                                                                  └─────────────────────────┘

ADMIN ASSIGNS RESCUER:
┌────────────┐    PUT /requests/:id  ┌──────────────┐    UPDATE   ┌─────────────────────────┐
│   Admin    │ ──────────────────> │   Backend    │ ──────────> │ helper_request_         │
│ Dashboard  │                      │   Server     │              │ - status: Assigned      │
└────────────┘                      └──────┬───────┘              │ - assigned_rescuer_id   │
                                           │                       └─────────────────────────┘
                                           │ INSERT
                                           ↓
                                    ┌─────────────────────────┐
                                    │ case_assigning          │
                                    │ - request_id            │
                                    │ - rescuer_id            │
                                    │ - status: Assigned      │
                                    └─────────────────────────┘

RESCUER ACCEPTS:
┌────────────┐    Accept Action     ┌──────────────┐    UPDATE   ┌─────────────────────────┐
│  Rescuer   │ ──────────────────> │   Backend    │ ──────────> │ case_assigning          │
│ Dashboard  │                      │   Server     │              │ - status: Accepted      │
└────────────┘                      └──────┬───────┘              │ - accepted_at: NOW()    │
                                           │                       └─────────────────────────┘
                                           │ UPDATE
                                           ↓
                                    ┌─────────────────────────┐
                                    │ helper_request_         │
                                    │ - status: Accepted      │
                                    └─────────────────────────┘
```

---

## 📊 Table Size & Growth Estimates

```
┌──────────────────────────────────────────────────────────────────────┐
│                    STORAGE ESTIMATES                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  helper_request_submission                                           │
│  ├─ Average row size: ~1 KB                                         │
│  ├─ Expected growth: 100-1,000 requests/day                         │
│  └─ Yearly estimate: ~365 MB                                        │
│                                                                      │
│  rescuer_registration                                                │
│  ├─ Average row size: ~0.5 KB                                       │
│  ├─ Expected growth: 10-100 rescuers/day                            │
│  └─ Yearly estimate: ~18 MB                                         │
│                                                                      │
│  case_assigning                                                      │
│  ├─ Average row size: ~0.3 KB                                       │
│  ├─ Expected growth: 100-1,000 assignments/day                      │
│  └─ Yearly estimate: ~110 MB                                        │
│                                                                      │
│  case_rejection                                                      │
│  ├─ Average row size: ~0.3 KB                                       │
│  ├─ Expected growth: 10-100 rejections/day (10% of assignments)     │
│  └─ Yearly estimate: ~11 MB                                         │
│                                                                      │
│  rescuer_directory                                                   │
│  ├─ Average row size: ~0.4 KB                                       │
│  ├─ Growth: 1:1 with rescuer_registration                           │
│  └─ Yearly estimate: ~15 MB                                         │
│                                                                      │
│  rescuer_assignment                                                  │
│  ├─ Average row size: ~0.5 KB (includes JSONB history)              │
│  ├─ Growth: 1:1 with case_assigning                                 │
│  └─ Yearly estimate: ~180 MB                                        │
│                                                                      │
│  TOTAL ESTIMATED YEARLY GROWTH: ~700 MB - 1 GB                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Dashboard-to-Table Mapping

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD VIEWS                                    │
└────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                          HELPER DASHBOARD                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Tables Used:                                                             ║
║  ✓ helper_request_submission (primary)                                    ║
║                                                                           ║
║  Displays:                                                                ║
║  • Request form (create new)                                              ║
║  • Request status (view submitted requests)                               ║
║  • Track assigned rescuer                                                 ║
║                                                                           ║
║  Queries:                                                                 ║
║  • SELECT * FROM helper_request_submission WHERE phone = ?                ║
║  • INSERT INTO helper_request_submission (...)                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                         RESCUER DASHBOARD                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Tables Used:                                                             ║
║  ✓ rescuer_registration (profile)                                         ║
║  ✓ case_assigning (assignments)                                           ║
║  ✓ case_rejection (rejection history)                                     ║
║  ✓ helper_request_submission (request details, via FK)                    ║
║                                                                           ║
║  Displays:                                                                ║
║  • Profile & verification status                                          ║
║  • Assigned cases                                                         ║
║  • Accept/Reject actions                                                  ║
║  • Mission history                                                        ║
║                                                                           ║
║  Queries:                                                                 ║
║  • SELECT * FROM case_assigning WHERE rescuer_id = ?                      ║
║  • UPDATE case_assigning SET status = 'Accepted' WHERE id = ?             ║
║  • INSERT INTO case_rejection (...)                                       ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                          ADMIN DASHBOARD                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Tables Used:                                                             ║
║  ✓ rescuer_directory (rescuer management)                                 ║
║  ✓ rescuer_assignment (workflow tracking)                                 ║
║  ✓ rescuer_registration (rescuer details, via FK)                         ║
║  ✓ helper_request_submission (requests, via FK)                           ║
║  ✓ case_assigning (assignment details, via FK)                            ║
║                                                                           ║
║  Displays:                                                                ║
║  • All rescuers with verification status                                  ║
║  • Background check management                                            ║
║  • Assignment workflow (Pending → Assigned → Accepted → Completed)        ║
║  • Complete audit trail (stage_history)                                   ║
║                                                                           ║
║  Queries:                                                                 ║
║  • SELECT rd.*, rr.* FROM rescuer_directory rd                            ║
║    JOIN rescuer_registration rr ON rd.rescuer_id = rr.id                 ║
║  • UPDATE rescuer_directory SET verification_status = 'Verified'          ║
║  • SELECT ra.*, hr.*, rr.* FROM rescuer_assignment ra                     ║
║    JOIN helper_request_submission hr ON ra.request_id = hr.id             ║
║    JOIN rescuer_registration rr ON ra.rescuer_id = rr.id                 ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔒 Security Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                  │
└────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                       LAYER 1: SUPABASE AUTH                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  • JWT-based authentication                                               ║
║  • Email confirmation (auto-confirmed for now)                            ║
║  • Password hashing (bcrypt)                                              ║
║  • Session management                                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                  ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                    LAYER 2: ROW LEVEL SECURITY (RLS)                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  ✓ All tables have RLS ENABLED                                            ║
║  • Default policies allow full access (for development)                   ║
║  • Production: Tighten policies per user role                             ║
║                                                                           ║
║  Example Production Policies:                                             ║
║  • Helpers: Can only see/edit their own requests                          ║
║  • Rescuers: Can only see assigned cases                                  ║
║  • Admins: Full access to all tables                                      ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                  ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                   LAYER 3: API KEY SEPARATION                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Frontend:                                                                ║
║  └─ SUPABASE_ANON_KEY (public, respects RLS)                              ║
║                                                                           ║
║  Backend:                                                                 ║
║  └─ SUPABASE_SERVICE_ROLE_KEY (secret, bypasses RLS)                      ║
║                                                                           ║
║  ⚠️  NEVER expose service role key in frontend!                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                  ↓
╔═══════════════════════════════════════════════════════════════════════════╗
║                    LAYER 4: FOREIGN KEY CONSTRAINTS                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  • Prevent orphaned records                                               ║
║  • Cascade deletes maintain referential integrity                         ║
║  • Cannot assign non-existent rescuers to requests                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## ⚡ Performance Optimizations

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANCE FEATURES                                │
└────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                              INDEXES                                      ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  helper_request_submission:                                               ║
║  ✓ idx_helper_status        ON (status)                                   ║
║  ✓ idx_helper_created       ON (created_at DESC)                          ║
║  ✓ idx_helper_badge         ON (badge_id)                                 ║
║  ✓ idx_helper_assigned      ON (assigned_rescuer_id)                      ║
║                                                                           ║
║  rescuer_registration:                                                    ║
║  ✓ idx_rescuer_email        ON (email)                                    ║
║  ✓ idx_rescuer_badge        ON (badge_id)                                 ║
║  ✓ idx_rescuer_status       ON (availability_status)                      ║
║  ✓ idx_rescuer_verification ON (verification_status)                      ║
║                                                                           ║
║  case_assigning:                                                          ║
║  ✓ idx_case_request         ON (request_id)                               ║
║  ✓ idx_case_rescuer         ON (rescuer_id)                               ║
║  ✓ idx_case_status          ON (status)                                   ║
║                                                                           ║
║  → Fast lookups, joins, and filtering                                     ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                           AUTO-UPDATING                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  • updated_at columns auto-refresh on every UPDATE                        ║
║  • No manual timestamp management needed                                  ║
║  • Triggers handle this automatically                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                      DATABASE CONNECTION POOLING                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  • Supabase manages connection pool automatically                         ║
║  • Edge Functions reuse connections                                       ║
║  • Minimal latency                                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

**This architecture provides a solid foundation for a production-ready rescue platform! 🚀**
