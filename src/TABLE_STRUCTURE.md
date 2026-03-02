# 📊 Hope Spot Database Structure
## Complete Table Reference for Separate Dashboard Tables

This document provides a comprehensive reference for all database tables in the Hope Spot application.

---

## 🎯 Table Organization by Dashboard

### Helper Dashboard
- **helper_request_submission** - All help requests from civilians

### Rescuer Dashboard  
- **rescuer_registration** - Rescuer accounts and profiles
- **case_assigning** - Assignments given to rescuers
- **case_rejection** - Rejected assignments with reasons

### Admin Dashboard
- **rescuer_directory** - Admin view of all rescuers with verification
- **rescuer_assignment** - Admin workflow and stage tracking

---

## 📋 Detailed Table Schemas

### 1. helper_request_submission (Helper Dashboard)

**Purpose**: Stores all emergency help requests submitted by civilians

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key, auto-generated | `a1b2c3d4-...` |
| `badge_id` | VARCHAR(20) | Human-readable ID (auto-generated) | `REQ-12345` |
| `helper_name` | VARCHAR(255) | Person requesting help | `John Doe` |
| `phone` | VARCHAR(20) | Contact number | `+1234567890` |
| `location` | TEXT | Address or location description | `123 Main St, City` |
| `latitude` | DECIMAL(10,8) | GPS latitude (optional) | `37.7749` |
| `longitude` | DECIMAL(11,8) | GPS longitude (optional) | `-122.4194` |
| `emergency_type` | VARCHAR(100) | Type of emergency | `Medical Emergency` |
| `description` | TEXT | Details about the situation | `Need immediate...` |
| `status` | VARCHAR(50) | Workflow status | `Pending` / `Assigned` / `Accepted` / `Completed` / `Rejected` |
| `assigned_rescuer_id` | UUID | FK to rescuer_registration.id | `x7y8z9...` |
| `assigned_rescuer_badge_id` | VARCHAR(20) | For display in UI | `RES-ABC123` |
| `priority` | VARCHAR(20) | Urgency level | `Low` / `Medium` / `High` / `Critical` |
| `created_at` | TIMESTAMPTZ | When request was submitted | `2026-02-26 10:30:00+00` |
| `updated_at` | TIMESTAMPTZ | Last modification (auto-updated) | `2026-02-26 11:45:00+00` |
| `completed_at` | TIMESTAMPTZ | When marked complete | `2026-02-26 14:20:00+00` |

**Indexes**:
- `idx_helper_status` on `status`
- `idx_helper_created` on `created_at DESC`
- `idx_helper_badge` on `badge_id`
- `idx_helper_assigned_rescuer` on `assigned_rescuer_id`

**Workflow States**:
```
Pending → Assigned → Accepted → Completed
                  ↓
               Rejected
```

---

### 2. rescuer_registration (Rescuer Dashboard)

**Purpose**: Stores rescuer accounts, profiles, and availability

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key, auto-generated | `r1s2t3u4-...` |
| `badge_id` | VARCHAR(20) | Human-readable ID (auto-generated) | `RES-ABC123` |
| `auth_user_id` | UUID | Links to Supabase Auth user | `auth-uuid...` |
| `name` | VARCHAR(255) | Rescuer's full name | `Jane Smith` |
| `email` | VARCHAR(255) | Email address (unique) | `jane@rescue.com` |
| `phone` | VARCHAR(20) | Contact number | `+0987654321` |
| `skills` | TEXT[] | Array of skills/certifications | `{Medical, First Aid, CPR}` |
| `location` | TEXT | Base location or address | `456 Oak Ave, City` |
| `latitude` | DECIMAL(10,8) | GPS latitude | `37.7749` |
| `longitude` | DECIMAL(11,8) | GPS longitude | `-122.4194` |
| `availability_status` | VARCHAR(50) | Current availability | `Available` / `Busy` / `Offline` |
| `verification_status` | VARCHAR(50) | Admin verification state | `Pending` / `Verified` / `Rejected` |
| `profile_photo_url` | TEXT | Profile picture URL | `https://...` |
| `total_missions_completed` | INTEGER | Count of completed missions | `42` |
| `rating` | DECIMAL(3,2) | Average rating (0-5) | `4.75` |
| `created_at` | TIMESTAMPTZ | Registration date | `2026-01-15 09:00:00+00` |
| `updated_at` | TIMESTAMPTZ | Last profile update | `2026-02-26 10:00:00+00` |
| `last_active_at` | TIMESTAMPTZ | Last seen timestamp | `2026-02-26 12:30:00+00` |

**Indexes**:
- `idx_rescuer_email` on `email`
- `idx_rescuer_badge` on `badge_id`
- `idx_rescuer_status` on `availability_status`
- `idx_rescuer_verification` on `verification_status`

**Status Values**:
- **availability_status**: `Available`, `Busy`, `Offline`
- **verification_status**: `Pending`, `Verified`, `Rejected`

---

### 3. case_assigning (Rescuer Dashboard)

**Purpose**: Tracks all case assignments to rescuers

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `c1d2e3f4-...` |
| `request_id` | UUID | FK to helper_request_submission.id | `req-uuid...` |
| `request_badge_id` | VARCHAR(20) | For display | `REQ-12345` |
| `rescuer_id` | UUID | FK to rescuer_registration.id | `rescuer-uuid...` |
| `rescuer_badge_id` | VARCHAR(20) | For display | `RES-ABC123` |
| `assigned_by` | VARCHAR(50) | Who assigned (Admin or System) | `ADM-XYZ` / `System` |
| `assigned_at` | TIMESTAMPTZ | When assignment was made | `2026-02-26 10:00:00+00` |
| `accepted_at` | TIMESTAMPTZ | When rescuer accepted | `2026-02-26 10:05:00+00` |
| `status` | VARCHAR(50) | Assignment status | `Assigned` / `Accepted` / `Completed` / `Rejected` |
| `notes` | TEXT | Assignment notes | `Patient is elderly...` |
| `estimated_arrival_time` | TIMESTAMPTZ | ETA to location | `2026-02-26 10:30:00+00` |
| `actual_arrival_time` | TIMESTAMPTZ | When rescuer arrived | `2026-02-26 10:28:00+00` |
| `completion_time` | TIMESTAMPTZ | When mission completed | `2026-02-26 11:15:00+00` |
| `updated_at` | TIMESTAMPTZ | Last update (auto) | `2026-02-26 11:15:00+00` |

**Indexes**:
- `idx_case_request` on `request_id`
- `idx_case_rescuer` on `rescuer_id`
- `idx_case_status` on `status`
- `idx_case_assigned_at` on `assigned_at DESC`

**Foreign Keys**:
- `request_id` → `helper_request_submission(id)` ON DELETE CASCADE
- `rescuer_id` → `rescuer_registration(id)` ON DELETE CASCADE

---

### 4. case_rejection (Rescuer Dashboard)

**Purpose**: Logs when rescuers reject assignments with reasons

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `rej1-uuid...` |
| `request_id` | UUID | FK to helper_request_submission.id | `req-uuid...` |
| `request_badge_id` | VARCHAR(20) | For display | `REQ-12345` |
| `rescuer_id` | UUID | FK to rescuer_registration.id | `rescuer-uuid...` |
| `rescuer_badge_id` | VARCHAR(20) | For display | `RES-ABC123` |
| `assignment_id` | UUID | FK to case_assigning.id (nullable) | `assign-uuid...` |
| `rejection_reason` | TEXT | Why it was rejected | `Too far from location` |
| `rejected_at` | TIMESTAMPTZ | When rejected | `2026-02-26 10:05:00+00` |
| `notes` | TEXT | Additional context | `Currently on another case` |

**Indexes**:
- `idx_rejection_request` on `request_id`
- `idx_rejection_rescuer` on `rescuer_id`
- `idx_rejection_date` on `rejected_at DESC`

**Foreign Keys**:
- `request_id` → `helper_request_submission(id)` ON DELETE CASCADE
- `rescuer_id` → `rescuer_registration(id)` ON DELETE CASCADE
- `assignment_id` → `case_assigning(id)` ON DELETE SET NULL

---

### 5. rescuer_directory (Admin Dashboard)

**Purpose**: Admin management view with verification and background checks

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `dir1-uuid...` |
| `rescuer_id` | UUID | FK to rescuer_registration.id (unique) | `rescuer-uuid...` |
| `rescuer_badge_id` | VARCHAR(20) | For display (unique) | `RES-ABC123` |
| `verified_by_admin_badge_id` | VARCHAR(20) | Admin who verified | `ADM-XYZ` |
| `verification_date` | TIMESTAMPTZ | When verified | `2026-01-20 14:00:00+00` |
| `verification_notes` | TEXT | Admin notes | `All documents verified` |
| `background_check_status` | VARCHAR(50) | Background check state | `Pending` / `Passed` / `Failed` |
| `training_status` | VARCHAR(50) | Training completion | `Not Started` / `In Progress` / `Completed` |
| `certifications` | TEXT[] | List of certifications | `{CPR, First Aid, EMT}` |
| `is_active` | BOOLEAN | Active status | `true` / `false` |
| `suspension_reason` | TEXT | If suspended, why | `Violated policy...` |
| `suspended_at` | TIMESTAMPTZ | Suspension date | `2026-02-15 09:00:00+00` |
| `created_at` | TIMESTAMPTZ | Entry creation | `2026-01-15 09:00:00+00` |
| `updated_at` | TIMESTAMPTZ | Last update (auto) | `2026-02-26 10:00:00+00` |

**Indexes**:
- `idx_directory_rescuer` on `rescuer_id`
- `idx_directory_active` on `is_active`
- `idx_directory_verification` on `background_check_status`

**Foreign Keys**:
- `rescuer_id` → `rescuer_registration(id)` ON DELETE CASCADE (UNIQUE)

**Status Values**:
- **background_check_status**: `Pending`, `Passed`, `Failed`
- **training_status**: `Not Started`, `In Progress`, `Completed`

---

### 6. rescuer_assignment (Admin Dashboard)

**Purpose**: Admin tracking of workflow stages and assignment history

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Primary key | `adm-assign-uuid...` |
| `request_id` | UUID | FK to helper_request_submission.id | `req-uuid...` |
| `request_badge_id` | VARCHAR(20) | For display | `REQ-12345` |
| `rescuer_id` | UUID | FK to rescuer_registration.id | `rescuer-uuid...` |
| `rescuer_badge_id` | VARCHAR(20) | For display | `RES-ABC123` |
| `assignment_id` | UUID | FK to case_assigning.id (nullable) | `assign-uuid...` |
| `workflow_stage` | VARCHAR(50) | Current stage in workflow | `Pending` / `Assigned` / `Accepted` / `Completed` |
| `assigned_by_admin_badge_id` | VARCHAR(20) | Admin who assigned | `ADM-XYZ` |
| `admin_notes` | TEXT | Admin comments | `High priority case` |
| `priority_override` | VARCHAR(20) | Admin priority change | `Critical` |
| `created_at` | TIMESTAMPTZ | Assignment creation | `2026-02-26 09:00:00+00` |
| `updated_at` | TIMESTAMPTZ | Last update (auto) | `2026-02-26 10:00:00+00` |
| `stage_history` | JSONB | Audit trail of stage changes | `[{stage: "Pending", at: "..."}, ...]` |

**Indexes**:
- `idx_assignment_request` on `request_id`
- `idx_assignment_rescuer` on `rescuer_id`
- `idx_assignment_stage` on `workflow_stage`
- `idx_assignment_created` on `created_at DESC`

**Foreign Keys**:
- `request_id` → `helper_request_submission(id)` ON DELETE CASCADE
- `rescuer_id` → `rescuer_registration(id)` ON DELETE CASCADE
- `assignment_id` → `case_assigning(id)` ON DELETE SET NULL

**Workflow Stages**:
```
Pending → Assigned → Accepted → Completed
```

**stage_history Example**:
```json
[
  {"stage": "Pending", "timestamp": "2026-02-26T09:00:00Z", "by": "System"},
  {"stage": "Assigned", "timestamp": "2026-02-26T09:05:00Z", "by": "ADM-XYZ"},
  {"stage": "Accepted", "timestamp": "2026-02-26T09:10:00Z", "by": "RES-ABC123"},
  {"stage": "Completed", "timestamp": "2026-02-26T11:00:00Z", "by": "RES-ABC123"}
]
```

---

## 🔗 Relationships Diagram

```
┌─────────────────────────────┐
│ helper_request_submission   │
│ (Helper Dashboard)          │
│ - id (PK)                   │
│ - badge_id                  │
│ - status                    │
│ - assigned_rescuer_id (FK)  │
└──────────┬──────────────────┘
           │
           │ assigned_rescuer_id
           │
           ↓
┌─────────────────────────────┐         ┌──────────────────────────┐
│ rescuer_registration        │◄────────│ rescuer_directory        │
│ (Rescuer Dashboard)         │         │ (Admin Dashboard)        │
│ - id (PK)                   │         │ - rescuer_id (FK)        │
│ - badge_id                  │         │ - verification_status    │
│ - auth_user_id              │         └──────────────────────────┘
│ - availability_status       │
└──────────┬──────────────────┘
           │
           │ rescuer_id
           │
           ↓
┌─────────────────────────────┐         ┌──────────────────────────┐
│ case_assigning              │         │ rescuer_assignment       │
│ (Rescuer Dashboard)         │         │ (Admin Dashboard)        │
│ - id (PK)                   │◄────────│ - assignment_id (FK)     │
│ - request_id (FK)           │         │ - workflow_stage         │
│ - rescuer_id (FK)           │         │ - stage_history          │
│ - status                    │         └──────────────────────────┘
└──────────┬──────────────────┘
           │
           │ assignment_id
           │
           ↓
┌─────────────────────────────┐
│ case_rejection              │
│ (Rescuer Dashboard)         │
│ - id (PK)                   │
│ - request_id (FK)           │
│ - rescuer_id (FK)           │
│ - assignment_id (FK)        │
│ - rejection_reason          │
└─────────────────────────────┘
```

---

## 🔧 Automatic Features

### Auto-Generated Badge IDs

Tables with auto-generated badge IDs:
- `helper_request_submission` → `REQ-12345` (random 5 digits)
- `rescuer_registration` → `RES-ABC123` (random 6 chars)

### Auto-Updated Timestamps

All tables have `updated_at` that automatically updates on any modification via trigger `update_updated_at_column()`.

### Cascading Deletes

- Deleting a **request** → deletes related assignments, rejections, admin tracking
- Deleting a **rescuer** → deletes their directory entry, assignments, rejections
- Deleting a **case_assigning** → sets `assignment_id` to NULL in rejections and admin tracking (preserves history)

---

## 📊 Common Queries

### Get All Pending Requests
```sql
SELECT * FROM helper_request_submission 
WHERE status = 'Pending' 
ORDER BY created_at DESC;
```

### Get Available Verified Rescuers
```sql
SELECT r.* 
FROM rescuer_registration r
JOIN rescuer_directory d ON r.id = d.rescuer_id
WHERE r.availability_status = 'Available'
  AND r.verification_status = 'Verified'
  AND d.is_active = true
ORDER BY r.rating DESC;
```

### Get Rescuer's Active Assignments
```sql
SELECT ca.*, hr.helper_name, hr.location, hr.emergency_type
FROM case_assigning ca
JOIN helper_request_submission hr ON ca.request_id = hr.id
WHERE ca.rescuer_id = 'rescuer-uuid-here'
  AND ca.status IN ('Assigned', 'Accepted')
ORDER BY ca.assigned_at DESC;
```

### Admin Dashboard: Full Assignment Overview
```sql
SELECT 
  ra.workflow_stage,
  hr.badge_id as request_badge,
  hr.emergency_type,
  rr.badge_id as rescuer_badge,
  rr.name as rescuer_name,
  ca.status as current_status,
  ra.stage_history
FROM rescuer_assignment ra
JOIN helper_request_submission hr ON ra.request_id = hr.id
JOIN rescuer_registration rr ON ra.rescuer_id = rr.id
LEFT JOIN case_assigning ca ON ra.assignment_id = ca.id
ORDER BY ra.created_at DESC;
```

---

## ✅ Migration Checklist

- [ ] All 6 tables created
- [ ] Triggers for badge IDs working
- [ ] Triggers for updated_at working  
- [ ] Foreign keys established
- [ ] Indexes created
- [ ] RLS policies enabled
- [ ] Sample data inserted (optional)
- [ ] Tested CRUD operations on each table
- [ ] Verified cascade deletes
- [ ] Backend code updated to use new tables

---

**This structure gives you full control over each dashboard's data! 🎉**
