# 🚀 Hope Spot Migration Guide
## Moving from Figma Make to Your Own Supabase Instance

This guide will walk you through migrating your Hope Spot application from the Figma Make environment to your own Supabase infrastructure with full database control.

---

## 📋 Prerequisites

- A Supabase account (free tier works fine)
- Basic understanding of SQL and environment variables
- Your current Figma Make app running

---

## ✅ Step-by-Step Migration Process

### Step 1: Create Your Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Hope Spot (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Step 2: Run the Database Migration SQL

1. In your new Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the `/migration.sql` file from your Figma Make project
4. **Copy the entire SQL content**
5. **Paste it** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

You should see: ✅ **Success. No rows returned**

This creates all 6 tables:
- ✅ `helper_request_submission` - Helper Dashboard
- ✅ `rescuer_registration` - Rescuer accounts
- ✅ `case_assigning` - Assignment tracking
- ✅ `case_rejection` - Rejection records
- ✅ `rescuer_directory` - Admin directory
- ✅ `rescuer_assignment` - Admin workflow tracking

### Step 3: Get Your Supabase Credentials

1. In your Supabase project, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values (you'll need them in Step 4):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (⚠️ Keep this SECRET!)
```

### Step 4: Update Environment Variables

**Important**: You need to update your connection strings in the Figma Make environment or deploy your app elsewhere.

#### Option A: Deploy to Your Own Server (Recommended)

1. Clone/download your Figma Make project
2. Create a `.env` file in the root:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

3. Deploy to:
   - **Vercel** (recommended for frontend + edge functions)
   - **Netlify**
   - **Deno Deploy** (for edge functions)
   - **Your own server**

#### Option B: Update Figma Make Environment (Temporary Testing)

If you want to test in Figma Make first:

1. You'll need to manually update the environment variables in Figma Make
2. This is not recommended long-term since you want full control

### Step 5: Verify Database Structure

Go to **Table Editor** in Supabase and verify all tables exist:

| Table Name | Purpose | Dashboard |
|------------|---------|-----------|
| `helper_request_submission` | Help requests from civilians | Helper |
| `rescuer_registration` | Rescuer profiles & accounts | Rescuer |
| `case_assigning` | Assignment tracking | Rescuer |
| `case_rejection` | Rejection logs | Rescuer |
| `rescuer_directory` | Rescuer verification & management | Admin |
| `rescuer_assignment` | Workflow stage tracking | Admin |

### Step 6: Test the Application

1. Start your application
2. Check the console logs - you should see:
   ```
   ✅ Database tables are ready
   ✅ Connected to separate table architecture
   ```

3. Test each dashboard:
   - **Helper Dashboard**: Submit a request → Check `helper_request_submission` table
   - **Rescuer Dashboard**: Sign up → Check `rescuer_registration` table
   - **Admin Dashboard**: View directory → Check `rescuer_directory` table

---

## 🔍 Verify Your Migration

### Quick Health Check

```sql
-- Run this in SQL Editor to verify all tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'helper_request_submission',
  'rescuer_registration',
  'case_assigning',
  'case_rejection',
  'rescuer_directory',
  'rescuer_assignment'
)
ORDER BY table_name;
```

Expected result: **6 tables** listed with their column counts.

---

## 🎯 What Changed in the Code

### Backend (Server)

**Before (KV Store)**:
```typescript
await kv.set(`req_${id}`, requestData);
const requests = await kv.getByPrefix("req_");
```

**After (Dedicated Tables)**:
```typescript
await db.helperRequests.create(requestData);
const requests = await db.helperRequests.getAll();
```

### Benefits of New Architecture

✅ **Separate tables** for each dashboard  
✅ **Relational data** with foreign keys  
✅ **SQL queries** with joins and complex filters  
✅ **Automatic badge ID generation** via triggers  
✅ **Updated_at timestamps** auto-maintained  
✅ **Row Level Security** policies configured  
✅ **Indexes** for fast queries  

---

## 🔐 Security Considerations

### ⚠️ IMPORTANT: Protect Your Service Role Key

- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- **ONLY** use it in server-side functions
- Use `SUPABASE_ANON_KEY` for frontend Supabase client
- The service role key **bypasses all RLS policies**

### Row Level Security (RLS)

The migration SQL includes basic RLS policies. For production, consider tightening them:

```sql
-- Example: Only allow users to see their own requests
CREATE POLICY "Users can view own requests" ON helper_request_submission
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 📊 Database Schema Overview

### Helper Dashboard Table

```sql
helper_request_submission
- id (UUID, auto-generated)
- badge_id (REQ-12345, auto-generated)
- helper_name, phone, location
- emergency_type, description
- status (Pending → Assigned → Accepted → Completed)
- assigned_rescuer_id (FK to rescuers)
```

### Rescuer Dashboard Tables

**rescuer_registration**:
```sql
- id (UUID)
- badge_id (RES-ABC123, auto-generated)
- auth_user_id (links to Supabase Auth)
- name, email, phone, skills[]
- availability_status (Available/Busy/Offline)
- verification_status (Pending/Verified/Rejected)
```

**case_assigning**:
```sql
- id (UUID)
- request_id (FK) + rescuer_id (FK)
- status (Assigned → Accepted → Completed)
- timestamps for workflow tracking
```

**case_rejection**:
```sql
- id (UUID)
- request_id, rescuer_id (FKs)
- rejection_reason, rejected_at
```

### Admin Dashboard Tables

**rescuer_directory**:
```sql
- rescuer_id (FK to rescuer_registration)
- verification info (background check, training)
- admin notes, suspension status
```

**rescuer_assignment**:
```sql
- Full workflow tracking
- stage_history (JSONB) - audit trail
- priority overrides
```

---

## 🐛 Troubleshooting

### Issue: "Table does not exist"

**Solution**:
1. Go to Supabase SQL Editor
2. Re-run the migration.sql
3. Check for any error messages in the SQL execution

### Issue: "Permission denied"

**Solution**:
- Verify RLS policies in Supabase Table Editor → RLS tab
- For testing, you can temporarily disable RLS (not recommended for production)

### Issue: "Badge ID not generating"

**Solution**:
The migration includes triggers. Verify they exist:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('helper_request_submission', 'rescuer_registration');
```

---

## 🎉 Migration Complete!

Once you've completed these steps, you have:

✅ Full database control with separate tables  
✅ Professional SQL schema with relationships  
✅ Automatic ID generation and timestamps  
✅ Scalable architecture ready for production  
✅ No more KV store limitations  

### Next Steps

1. **Add more features** - Complex queries, analytics, reporting
2. **Enhance security** - Fine-tune RLS policies
3. **Set up backups** - Configure daily backups in Supabase
4. **Add monitoring** - Track performance and errors
5. **Scale up** - Upgrade Supabase plan as needed

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **SQL Reference**: https://www.postgresql.org/docs/
- **Community**: https://github.com/supabase/supabase/discussions

---

**Good luck with your migration! 🚀**
