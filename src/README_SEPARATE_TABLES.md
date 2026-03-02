# 🏥 Hope Spot - Separate Table Architecture

## Complete Database Migration to Dedicated Tables

Your Hope Spot rescue-response platform now uses a **professional, separate-table database architecture** instead of a single KV store. Each dashboard has its own dedicated tables with full relational database capabilities.

---

## 📊 Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HELPER DASHBOARD                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      helper_request_submission                           │  │
│  │  - badge_id: REQ-12345 (auto-generated)                  │  │
│  │  - status: Pending → Assigned → Accepted → Completed     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       RESCUER DASHBOARD                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      rescuer_registration                                │  │
│  │  - badge_id: RES-ABC123 (auto-generated)                 │  │
│  │  - availability: Available / Busy / Offline              │  │
│  │  - verification: Pending / Verified / Rejected           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      case_assigning                                      │  │
│  │  - Links requests to rescuers                            │  │
│  │  - Tracks acceptance and completion                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      case_rejection                                      │  │
│  │  - Logs rejection reasons                                │  │
│  │  - Historical tracking                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      rescuer_directory                                   │  │
│  │  - Rescuer verification & management                     │  │
│  │  - Background checks & training                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      rescuer_assignment                                  │  │
│  │  - Workflow stage tracking                               │  │
│  │  - Audit trail (stage_history JSON)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Migration Files

### 🔴 Critical Files (Must Use)

| File | Purpose | Action Required |
|------|---------|-----------------|
| **`/migration.sql`** | Complete SQL schema for all 6 tables | **Run this in Supabase SQL Editor** |
| **`/MIGRATION_GUIDE.md`** | Step-by-step setup instructions | Follow to complete migration |

### 📘 Reference Documentation

| File | Purpose | Use When |
|------|---------|----------|
| **`/MIGRATION_SUMMARY.md`** | Overview & quick reference | Want a summary of changes |
| **`/TABLE_STRUCTURE.md`** | Detailed table schemas | Writing SQL queries |
| **`/API_REFERENCE.md`** | Complete API documentation | Calling backend from frontend |
| **`/README_SEPARATE_TABLES.md`** | This file - main overview | Getting started |

### 🔧 Code Files (Already Updated)

| File | What Changed |
|------|--------------|
| **`/supabase/functions/server/database.tsx`** | NEW - Database service layer for all tables |
| **`/supabase/functions/server/index.tsx`** | UPDATED - Uses new tables instead of KV store |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Supabase Project
```bash
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: Hope Spot
4. Choose a strong database password
5. Click "Create new project"
```

### Step 2: Run Migration SQL
```bash
1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Copy all content from /migration.sql
4. Paste and click "Run"
5. Verify success message
```

### Step 3: Update Environment Variables
```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Done! Your app now uses separate tables!** ✅

---

## 📋 What Each Table Does

### Helper Dashboard

**`helper_request_submission`**
- Stores all emergency help requests from civilians
- Auto-generates badge IDs like `REQ-12345`
- Tracks workflow: Pending → Assigned → Accepted → Completed
- Links to assigned rescuer

**Example Record**:
```json
{
  "badge_id": "REQ-12345",
  "helper_name": "John Doe",
  "phone": "+1234567890",
  "location": "123 Main St, City",
  "emergency_type": "Medical Emergency",
  "status": "Pending",
  "created_at": "2026-02-26T10:00:00Z"
}
```

### Rescuer Dashboard

**`rescuer_registration`**
- Rescuer accounts and profiles
- Auto-generates badge IDs like `RES-ABC123`
- Links to Supabase Auth
- Tracks availability and verification status

**`case_assigning`**
- Links requests to rescuers
- Tracks assignment workflow
- Records timestamps for acceptance and completion

**`case_rejection`**
- Logs when rescuers reject assignments
- Stores rejection reasons
- Maintains historical record

### Admin Dashboard

**`rescuer_directory`**
- Admin management of all rescuers
- Background check and training status
- Verification notes and suspension tracking

**`rescuer_assignment`**
- Admin view of all assignments
- Workflow stage tracking
- Complete audit trail via `stage_history` JSONB field

---

## ✨ Key Features

### 🆔 Auto-Generated Badge IDs
```sql
INSERT INTO helper_request_submission (helper_name, ...)
-- Automatically gets: badge_id = 'REQ-12345'

INSERT INTO rescuer_registration (name, email, ...)
-- Automatically gets: badge_id = 'RES-ABC123'
```

### ⏰ Auto-Updated Timestamps
```sql
UPDATE helper_request_submission SET status = 'Assigned' ...
-- updated_at automatically set to current time
```

### 🔗 Foreign Key Relationships
```sql
-- Requests link to Rescuers
helper_request_submission.assigned_rescuer_id → rescuer_registration.id

-- Assignments link to both
case_assigning.request_id → helper_request_submission.id
case_assigning.rescuer_id → rescuer_registration.id

-- Directory links to Rescuers
rescuer_directory.rescuer_id → rescuer_registration.id
```

### 🗑️ Cascade Deletes
Delete a rescuer → automatically deletes their:
- Directory entry
- Assignments
- Rejections

### 🚀 Performance Indexes
All tables have indexes on:
- Badge IDs (for fast lookups)
- Status fields (for filtering)
- Foreign keys (for joins)
- Timestamps (for sorting)

---

## 🔄 Workflow Example

### 1. Helper Submits Request
```typescript
const response = await fetch(`${baseUrl}/requests`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({
    helper_name: 'John Doe',
    phone: '+1234567890',
    location: '123 Main St',
    emergency_type: 'Medical Emergency',
    description: 'Need immediate help'
  })
});

// Returns: { badge_id: 'REQ-12345', status: 'Pending', ... }
```

### 2. Admin Assigns Rescuer
```typescript
await fetch(`${baseUrl}/requests/${requestId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({
    status: 'Assigned',
    assigned_rescuer_id: rescuerId,
    assigned_rescuer_badge_id: 'RES-ABC123'
  })
});

// Also creates entry in case_assigning table
```

### 3. Rescuer Accepts
```typescript
// Update case_assigning status
await db.caseAssigning.update(assignmentId, {
  status: 'Accepted',
  accepted_at: new Date().toISOString()
});

// Update request status
await fetch(`${baseUrl}/requests/${requestId}`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'Accepted' })
});
```

### 4. Rescuer Completes
```typescript
// Mark assignment complete
await db.caseAssigning.update(assignmentId, {
  status: 'Completed',
  completion_time: new Date().toISOString()
});

// Mark request complete
await fetch(`${baseUrl}/requests/${requestId}`, {
  method: 'PUT',
  body: JSON.stringify({
    status: 'Completed',
    completed_at: new Date().toISOString()
  })
});
```

---

## 🧪 Testing Your Migration

### 1. Health Check
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6/health
# Expected: { "status": "ok" }
```

### 2. Create Test Request
```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6/requests \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "helper_name": "Test User",
    "phone": "+1234567890",
    "location": "Test Location",
    "emergency_type": "Test",
    "description": "Test request"
  }'
```

### 3. Verify in Supabase
1. Go to Supabase → Table Editor
2. Select `helper_request_submission`
3. You should see your test request with auto-generated `badge_id`

---

## 📊 Database Service Layer

Your backend has these helper functions:

### Helper Requests
```typescript
import * as db from './database.tsx';

// Get all requests
const requests = await db.helperRequests.getAll();

// Get by badge ID
const request = await db.helperRequests.getByBadgeId('REQ-12345');

// Create request
const newRequest = await db.helperRequests.create({
  helper_name: 'John',
  phone: '+1234567890',
  location: 'Test',
  emergency_type: 'Medical'
});

// Update status
await db.helperRequests.update(id, { status: 'Assigned' });
```

### Rescuer Registration
```typescript
// Get all rescuers
const rescuers = await db.rescuerRegistration.getAll();

// Get available rescuers
const available = await db.rescuerRegistration.getAvailable();

// Create rescuer
const rescuer = await db.rescuerRegistration.create({
  name: 'Jane Smith',
  email: 'jane@rescue.com',
  phone: '+0987654321'
});
```

### Assignments
```typescript
// Get rescuer's assignments
const assignments = await db.caseAssigning.getByRescuerId(rescuerId);

// Create assignment
const assignment = await db.caseAssigning.create({
  request_id: requestId,
  rescuer_id: rescuerId,
  status: 'Assigned'
});

// Update assignment
await db.caseAssigning.update(assignmentId, {
  status: 'Accepted',
  accepted_at: new Date().toISOString()
});
```

---

## 🔐 Security Best Practices

### ⚠️ Protect Service Role Key
```typescript
// ❌ NEVER do this (frontend)
const supabase = createClient(url, SUPABASE_SERVICE_ROLE_KEY);

// ✅ Frontend: Use anon key
const supabase = createClient(url, SUPABASE_ANON_KEY);

// ✅ Backend only: Service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);
```

### Row Level Security (RLS)
The migration includes basic RLS policies. For production, tighten them:

```sql
-- Example: Users can only see their own requests
CREATE POLICY "Users view own requests" ON helper_request_submission
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Only admins can verify rescuers
CREATE POLICY "Admins verify rescuers" ON rescuer_directory
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📖 Documentation Index

| Topic | Document | Use For |
|-------|----------|---------|
| **Getting Started** | MIGRATION_GUIDE.md | Initial setup steps |
| **Quick Overview** | MIGRATION_SUMMARY.md | See what changed |
| **Table Details** | TABLE_STRUCTURE.md | Column reference |
| **API Calls** | API_REFERENCE.md | Frontend integration |
| **SQL Schema** | migration.sql | Database setup |
| **This File** | README_SEPARATE_TABLES.md | Main overview |

---

## ✅ Migration Checklist

- [ ] Created Supabase project
- [ ] Copied Project URL and API keys
- [ ] Ran `/migration.sql` in SQL Editor
- [ ] Verified all 6 tables exist
- [ ] Updated environment variables
- [ ] Tested `/health` endpoint
- [ ] Created test request
- [ ] Verified auto-generated badge ID
- [ ] Signed up test rescuer
- [ ] Verified rescuer in directory table
- [ ] Frontend dashboards loading correctly

---

## 🎉 Benefits of New Architecture

### Before (KV Store)
```typescript
await kv.set('req_12345', { ... });
await kv.set('rescuer_abc', { ... });
const data = await kv.getByPrefix('req_');
```

❌ No relationships  
❌ No foreign keys  
❌ Limited queries  
❌ All in one table  
❌ Manual ID generation  

### After (Separate Tables)
```typescript
await db.helperRequests.create({ ... });
await db.rescuerRegistration.create({ ... });
const data = await db.helperRequests.getAll();
```

✅ Dedicated table per dashboard  
✅ Foreign key relationships  
✅ Complex SQL queries  
✅ Auto-generated badge IDs  
✅ Professional database structure  
✅ Audit trails and history  
✅ Cascade deletes  
✅ Performance indexes  

---

## 🚀 Next Steps

1. **Complete Migration** - Follow MIGRATION_GUIDE.md
2. **Test Thoroughly** - Use API_REFERENCE.md for testing
3. **Deploy to Production** - Vercel, Netlify, or Deno Deploy
4. **Add Features** - Now you can do complex queries and joins!
5. **Monitor & Scale** - Set up backups and monitoring

---

## 📞 Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Migration Files**: All in your project root

---

**Your Hope Spot platform is now production-ready with a professional database architecture! 🏗️🎉**

Built with ❤️ for rescue operations
