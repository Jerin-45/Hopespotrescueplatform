# 🌐 Hope Spot API Reference
## Complete Backend Endpoint Documentation

This document describes all available API endpoints for the Hope Spot application with the new separate table architecture.

---

## 🔧 Base Configuration

**Base URL**: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6`

**Headers Required**:
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
}
```

---

## 📋 Helper Dashboard Endpoints

### Get All Help Requests

**Endpoint**: `GET /requests`

**Description**: Fetches all help requests from `helper_request_submission` table

**Response**:
```json
[
  {
    "id": "uuid-here",
    "badge_id": "REQ-12345",
    "helper_name": "John Doe",
    "phone": "+1234567890",
    "location": "123 Main St",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "emergency_type": "Medical Emergency",
    "description": "Need immediate help",
    "status": "Pending",
    "assigned_rescuer_id": null,
    "assigned_rescuer_badge_id": null,
    "priority": "Medium",
    "created_at": "2026-02-26T10:00:00Z",
    "updated_at": "2026-02-26T10:00:00Z",
    "completed_at": null
  }
]
```

**Frontend Example**:
```typescript
const response = await fetch(
  `${baseUrl}/requests`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
const requests = await response.json();
```

---

### Create New Help Request

**Endpoint**: `POST /requests`

**Description**: Creates a new help request in `helper_request_submission` table

**Request Body**:
```json
{
  "helper_name": "John Doe",
  "phone": "+1234567890",
  "location": "123 Main St, City",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "emergency_type": "Medical Emergency",
  "description": "Need immediate medical assistance",
  "priority": "High"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "badge_id": "REQ-12345",
    "helper_name": "John Doe",
    "status": "Pending",
    "created_at": "2026-02-26T10:00:00Z",
    ...
  }
}
```

**Notes**:
- `badge_id` is **auto-generated** (e.g., `REQ-12345`)
- `status` defaults to `"Pending"`
- `created_at` and `updated_at` are auto-set

**Frontend Example**:
```typescript
const response = await fetch(
  `${baseUrl}/requests`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      helper_name: 'John Doe',
      phone: '+1234567890',
      location: '123 Main St',
      emergency_type: 'Medical Emergency',
      description: 'Need help',
      priority: 'High'
    })
  }
);
const result = await response.json();
console.log('Request created:', result.data.badge_id);
```

---

### Update Help Request

**Endpoint**: `PUT /requests/:id`

**Description**: Updates an existing help request

**URL Parameters**:
- `id` - UUID of the request

**Request Body** (partial update supported):
```json
{
  "status": "Assigned",
  "assigned_rescuer_id": "rescuer-uuid",
  "assigned_rescuer_badge_id": "RES-ABC123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "badge_id": "REQ-12345",
    "status": "Assigned",
    "assigned_rescuer_id": "rescuer-uuid",
    "updated_at": "2026-02-26T10:30:00Z",
    ...
  }
}
```

**Frontend Example**:
```typescript
const response = await fetch(
  `${baseUrl}/requests/${requestId}`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      status: 'Assigned',
      assigned_rescuer_id: rescuerId,
      assigned_rescuer_badge_id: rescuerBadgeId
    })
  }
);
```

---

## 🚑 Rescuer Dashboard Endpoints

### Get All Rescuers

**Endpoint**: `GET /rescuers`

**Description**: Fetches all rescuers from `rescuer_registration` table

**Response**:
```json
[
  {
    "id": "uuid-here",
    "badge_id": "RES-ABC123",
    "auth_user_id": "auth-uuid",
    "name": "Jane Smith",
    "email": "jane@rescue.com",
    "phone": "+0987654321",
    "skills": ["Medical", "First Aid", "CPR"],
    "location": "456 Oak Ave",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "availability_status": "Available",
    "verification_status": "Verified",
    "profile_photo_url": null,
    "total_missions_completed": 42,
    "rating": 4.75,
    "created_at": "2026-01-15T09:00:00Z",
    "updated_at": "2026-02-26T10:00:00Z",
    "last_active_at": "2026-02-26T12:00:00Z"
  }
]
```

**Frontend Example**:
```typescript
const response = await fetch(
  `${baseUrl}/rescuers`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`
    }
  }
);
const rescuers = await response.json();
```

---

### Create Rescuer Profile

**Endpoint**: `POST /rescuers`

**Description**: Creates a new rescuer profile in `rescuer_registration` table

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@rescue.com",
  "phone": "+0987654321",
  "location": "456 Oak Ave, City",
  "skills": ["Medical", "First Aid"],
  "auth_user_id": "auth-uuid-from-signup"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "badge_id": "RES-ABC123",
    "name": "Jane Smith",
    "availability_status": "Available",
    "verification_status": "Pending",
    ...
  }
}
```

**Notes**:
- `badge_id` is **auto-generated** (e.g., `RES-ABC123`)
- `availability_status` defaults to `"Available"`
- `verification_status` defaults to `"Pending"`
- A corresponding entry in `rescuer_directory` is also created

---

## 🔐 Authentication Endpoints

### Rescuer Signup

**Endpoint**: `POST /signup`

**Description**: Creates a Supabase Auth user + rescuer profile + directory entry

**Request Body**:
```json
{
  "email": "jane@rescue.com",
  "password": "SecurePassword123!",
  "name": "Jane Smith",
  "phone": "+0987654321",
  "address": "456 Oak Ave, City"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "auth-user-id",
    "email": "jane@rescue.com",
    ...
  },
  "profile": {
    "id": "profile-uuid",
    "badge_id": "RES-ABC123",
    "name": "Jane Smith",
    "email": "jane@rescue.com",
    "verification_status": "Pending",
    ...
  }
}
```

**What it Creates**:
1. ✅ Supabase Auth user (with `email_confirm: true`)
2. ✅ Entry in `rescuer_registration` table
3. ✅ Entry in `rescuer_directory` table

**Error Responses**:
- `400` - Missing email or password
- `409` - Email already registered

**Frontend Example**:
```typescript
const response = await fetch(
  `${baseUrl}/signup`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({
      email: 'jane@rescue.com',
      password: 'SecurePassword123!',
      name: 'Jane Smith',
      phone: '+0987654321',
      address: '456 Oak Ave'
    })
  }
);

if (response.status === 409) {
  console.error('Email already registered');
} else {
  const result = await response.json();
  console.log('Signup successful! Badge ID:', result.profile.badge_id);
}
```

---

## 🏥 Health Check

**Endpoint**: `GET /health`

**Description**: Check if the server is running

**Response**:
```json
{
  "status": "ok"
}
```

---

## 🎯 Database Service Layer (Server-Side)

Your backend has a database service layer at `/supabase/functions/server/database.tsx` with these methods:

### Helper Requests
```typescript
// Get all requests
await db.helperRequests.getAll()

// Get by ID
await db.helperRequests.getById(id)

// Get by badge ID
await db.helperRequests.getByBadgeId('REQ-12345')

// Create request
await db.helperRequests.create(requestData)

// Update request
await db.helperRequests.update(id, updates)

// Get by status
await db.helperRequests.getByStatus('Pending')
```

### Rescuer Registration
```typescript
// Get all rescuers
await db.rescuerRegistration.getAll()

// Get by ID
await db.rescuerRegistration.getById(id)

// Get by badge ID
await db.rescuerRegistration.getByBadgeId('RES-ABC123')

// Get by email
await db.rescuerRegistration.getByEmail(email)

// Create rescuer
await db.rescuerRegistration.create(rescuerData)

// Update rescuer
await db.rescuerRegistration.update(id, updates)

// Get available rescuers
await db.rescuerRegistration.getAvailable()
```

### Case Assigning
```typescript
// Get all assignments
await db.caseAssigning.getAll()

// Get by rescuer
await db.caseAssigning.getByRescuerId(rescuerId)

// Get by request
await db.caseAssigning.getByRequestId(requestId)

// Create assignment
await db.caseAssigning.create(assignmentData)

// Update assignment
await db.caseAssigning.update(id, updates)
```

### Case Rejection
```typescript
// Get all rejections
await db.caseRejection.getAll()

// Get by rescuer
await db.caseRejection.getByRescuerId(rescuerId)

// Create rejection
await db.caseRejection.create(rejectionData)
```

### Rescuer Directory (Admin)
```typescript
// Get all directory entries
await db.rescuerDirectory.getAll()

// Get by rescuer ID
await db.rescuerDirectory.getByRescuerId(rescuerId)

// Create directory entry
await db.rescuerDirectory.create(entryData)

// Update directory entry
await db.rescuerDirectory.update(rescuerId, updates)
```

### Rescuer Assignment (Admin)
```typescript
// Get all assignments
await db.rescuerAssignment.getAll()

// Create assignment
await db.rescuerAssignment.create(assignmentData)

// Update workflow stage
await db.rescuerAssignment.updateStage(id, stage, stageHistory)
```

---

## 🔄 Workflow State Transitions

### Helper Request Status Flow
```
Pending → Assigned → Accepted → Completed
                  ↓
               Rejected
```

**Status Values**:
- `Pending` - Just submitted, no rescuer assigned
- `Assigned` - Admin/system assigned a rescuer
- `Accepted` - Rescuer accepted the assignment
- `Completed` - Mission completed
- `Rejected` - Rescuer rejected the assignment

### Rescuer Availability
```
Available ⇄ Busy ⇄ Offline
```

**Status Values**:
- `Available` - Ready to take assignments
- `Busy` - Currently on a mission
- `Offline` - Not available

### Rescuer Verification
```
Pending → Verified
       ↓
    Rejected
```

**Status Values**:
- `Pending` - Awaiting admin verification
- `Verified` - Approved by admin
- `Rejected` - Application denied

---

## 🛡️ Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Descriptive error message"
}
```

**HTTP Status Codes**:
- `200` - Success
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (invalid or missing auth)
- `404` - Not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Server error

**Error Handling Example**:
```typescript
try {
  const response = await fetch(`${baseUrl}/requests`, {
    headers: { 'Authorization': `Bearer ${publicAnonKey}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
    return [];
  }
  
  const data = await response.json();
  return data;
  
} catch (error) {
  console.error('Network error:', error);
  return [];
}
```

---

## 📊 Example: Complete Request Flow

### 1. Helper Submits Request
```typescript
// POST /requests
const request = await createRequest({
  helper_name: 'John Doe',
  phone: '+1234567890',
  location: '123 Main St',
  emergency_type: 'Medical Emergency',
  description: 'Need help',
  priority: 'High'
});
// Returns: { badge_id: 'REQ-12345', status: 'Pending', ... }
```

### 2. Admin Assigns Rescuer
```typescript
// PUT /requests/{id}
await updateRequest(requestId, {
  status: 'Assigned',
  assigned_rescuer_id: rescuerId,
  assigned_rescuer_badge_id: 'RES-ABC123'
});

// Also create assignment record (server-side)
await db.caseAssigning.create({
  request_id: requestId,
  request_badge_id: 'REQ-12345',
  rescuer_id: rescuerId,
  rescuer_badge_id: 'RES-ABC123',
  assigned_by: 'ADM-XYZ',
  status: 'Assigned'
});
```

### 3. Rescuer Accepts
```typescript
// Update assignment
await db.caseAssigning.update(assignmentId, {
  status: 'Accepted',
  accepted_at: new Date().toISOString()
});

// Update request status
await updateRequest(requestId, {
  status: 'Accepted'
});
```

### 4. Rescuer Completes Mission
```typescript
// Update assignment
await db.caseAssigning.update(assignmentId, {
  status: 'Completed',
  completion_time: new Date().toISOString()
});

// Update request
await updateRequest(requestId, {
  status: 'Completed',
  completed_at: new Date().toISOString()
});

// Update rescuer stats
await db.rescuerRegistration.update(rescuerId, {
  total_missions_completed: rescuer.total_missions_completed + 1,
  availability_status: 'Available'
});
```

---

## 🔍 Testing Your API

### Using cURL

```bash
# Get all requests
curl -X GET \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6/requests" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Create request
curl -X POST \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6/requests" \
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

### Using Browser Console

```javascript
const baseUrl = 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d090c6';
const anonKey = 'YOUR_ANON_KEY';

// Test GET
fetch(`${baseUrl}/requests`, {
  headers: { 'Authorization': `Bearer ${anonKey}` }
})
  .then(r => r.json())
  .then(console.log);

// Test POST
fetch(`${baseUrl}/requests`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({
    helper_name: 'Test',
    phone: '+1234567890',
    location: 'Test Location',
    emergency_type: 'Test',
    description: 'Test'
  })
})
  .then(r => r.json())
  .then(console.log);
```

---

## ✅ Migration Checklist

Before using the API:

- [ ] Run `/migration.sql` in your Supabase SQL Editor
- [ ] Update `SUPABASE_URL` environment variable
- [ ] Update `SUPABASE_ANON_KEY` environment variable
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` environment variable (server-only!)
- [ ] Test `/health` endpoint
- [ ] Test creating a request
- [ ] Test rescuer signup
- [ ] Verify data in Supabase Table Editor

---

**Your API is now ready with separate tables for each dashboard! 🎉**
