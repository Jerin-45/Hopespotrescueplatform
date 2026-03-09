import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', logger(console.log));

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

const R = '/make-server-12d090c6';

// ── Five-table namespaces (simulated via KV key prefixes) ──────────────────
// Each prefix acts as an isolated "table" in the kv_store_12d090c6 Supabase table.
const TABLE = {
  HELPER_SUBMITTED:   'hs:',   // helper_submitted  – raw form submissions by helpers
  CASE_DETAILS:       'cd:',   // case_details       – full case lifecycle record
  RESCUER_ASSIGNMENT: 'ra:',   // rescuer_assignment – assignment records per case
  RESCUER_REGISTER:   'rr:',   // rescuer_register   – rescuer account profiles
  RESCUER_DIRECTORY:  'rd:',   // rescuer_directory  – public-facing rescuer directory
  AUTH:               'auth:', // auth credentials   – hashed password store
};

// ── Utilities ────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Health check ─────────────────────────────────────────────────────────────

app.get(`${R}/health`, (c) =>
  c.json({
    status: 'ok',
    tables: {
      helper_submitted:   TABLE.HELPER_SUBMITTED,
      case_details:       TABLE.CASE_DETAILS,
      rescuer_assignment: TABLE.RESCUER_ASSIGNMENT,
      rescuer_register:   TABLE.RESCUER_REGISTER,
      rescuer_directory:  TABLE.RESCUER_DIRECTORY,
    },
  })
);

// ── CASE DETAILS table (/cases) ───────────────────────────────────────────────

/**
 * GET /cases
 * Returns all records from the case_details table, sorted newest first.
 */
app.get(`${R}/cases`, async (c) => {
  try {
    const cases = await kv.getByPrefix(TABLE.CASE_DETAILS);
    const sorted = (cases as any[]).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return c.json({ data: sorted });
  } catch (err: any) {
    console.error('Error fetching cases from case_details table:', err);
    return c.json({ error: `Failed to fetch cases: ${err.message}` }, 500);
  }
});

/**
 * POST /cases
 * Creates a record in helper_submitted AND case_details tables simultaneously.
 * Returns the new case record.
 */
app.post(`${R}/cases`, async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const trackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;
    const now = new Date().toISOString();

    // ── helper_submitted table record ──────────────────────────────────────
    const helperSubmission = {
      id,
      helperName:    body.helperName,
      helperPhone:   body.helperPhone,
      helperAltPhone: body.helperAltPhone || '',
      helperEmail:   body.helperEmail || '',
      location:      body.location,
      photoUrl:      body.photoUrl || '',
      notes:         body.notes,
      submittedAt:   now,
    };

    // ── case_details table record ──────────────────────────────────────────
    const caseRecord = {
      ...helperSubmission,
      trackingId,
      status:       'pending',
      timestamp:    now,
      lastModified: now,
      assignedRescuer: '',
      rescuerId:    '',
      rescuerNotes: '',
      rejectedBy:   [],
      rejectionReasons: [],
    };

    await kv.set(`${TABLE.HELPER_SUBMITTED}${id}`, helperSubmission);
    await kv.set(`${TABLE.CASE_DETAILS}${id}`, caseRecord);

    console.log(`✅ helper_submitted[${id}] + case_details[${id}] created`);
    return c.json({ data: caseRecord }, 201);
  } catch (err: any) {
    console.error('Error creating case:', err);
    return c.json({ error: `Failed to create case: ${err.message}` }, 500);
  }
});

/**
 * PUT /cases/:id
 * Updates a record in the case_details table.
 * If the update includes a rescuerId, also writes/updates the rescuer_assignment table.
 */
app.put(`${R}/cases/:id`, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const now = new Date().toISOString();

    const existing = await kv.get(`${TABLE.CASE_DETAILS}${id}`) as any;
    if (!existing) {
      return c.json({ error: `case_details record not found for id: ${id}` }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id, // guard against id being overwritten
      lastModified: now,
    };

    await kv.set(`${TABLE.CASE_DETAILS}${id}`, updated);

    // ── rescuer_assignment table record ────────────────────────────────────
    if (body.rescuerId) {
      const assignment = {
        id:           id,
        caseId:       id,
        trackingId:   existing.trackingId || updated.trackingId,
        rescuerId:    body.rescuerId,
        rescuerName:  body.assignedRescuer || body.rescuerId,
        status:       body.status || 'assigned',
        assignedAt:   now,
        lastModified: now,
      };
      await kv.set(`${TABLE.RESCUER_ASSIGNMENT}${id}`, assignment);
      console.log(`✅ rescuer_assignment[${id}] updated → rescuer ${body.rescuerId}`);
    }

    console.log(`✅ case_details[${id}] updated to status: ${body.status}`);
    return c.json({ data: updated });
  } catch (err: any) {
    console.error('Error updating case:', err);
    return c.json({ error: `Failed to update case: ${err.message}` }, 500);
  }
});

// ── RESCUER REGISTER table (/rescuers) ─────────────────────────────────────

/**
 * GET /rescuers
 * Returns all records from the rescuer_register table, sorted newest first.
 */
app.get(`${R}/rescuers`, async (c) => {
  try {
    const rescuers = await kv.getByPrefix(TABLE.RESCUER_REGISTER);
    const sorted = (rescuers as any[]).sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
    return c.json({ data: sorted });
  } catch (err: any) {
    console.error('Error fetching rescuers from rescuer_register table:', err);
    return c.json({ error: `Failed to fetch rescuers: ${err.message}` }, 500);
  }
});

/**
 * POST /rescuers
 * Creates a record in rescuer_register AND rescuer_directory tables.
 * Also stores hashed credentials in the auth namespace.
 */
app.post(`${R}/rescuers`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, address } = body;

    if (!email || !password || !name || !phone || !address) {
      return c.json({ error: 'Missing required fields: email, password, name, phone, address' }, 400);
    }

    // Check uniqueness in the auth namespace
    const existing = await kv.get(`${TABLE.AUTH}${email}`);
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    const id = crypto.randomUUID();
    const badge_id = `RSC-${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    // ── Auth namespace (credentials only) ─────────────────────────────────
    await kv.set(`${TABLE.AUTH}${email}`, {
      userId:       id,
      email,
      passwordHash,
      createdAt:    now,
    });

    // ── rescuer_register table record ──────────────────────────────────────
    const rescuerRecord = {
      id,
      email,
      name,
      phone,
      address,
      badge_id,
      displayId:       badge_id,
      registeredAt:    now,
      profileComplete: true,
    };
    await kv.set(`${TABLE.RESCUER_REGISTER}${id}`, rescuerRecord);

    // ── rescuer_directory table record (public view) ───────────────────────
    const directoryRecord = {
      id,
      name,
      email,
      phone,
      address,
      badge_id,
      displayId:    badge_id,
      registeredAt: now,
    };
    await kv.set(`${TABLE.RESCUER_DIRECTORY}${id}`, directoryRecord);

    console.log(`✅ rescuer_register[${id}] + rescuer_directory[${id}] created (badge: ${badge_id})`);
    return c.json({ data: { id, badge_id, displayId: badge_id, name, email } }, 201);
  } catch (err: any) {
    console.error('Error registering rescuer:', err);
    return c.json({ error: `Failed to register rescuer: ${err.message}` }, 500);
  }
});

// ── RESCUER DIRECTORY table (/rescuer-directory) ───────────────────────────

/**
 * GET /rescuer-directory
 * Returns all records from the rescuer_directory table.
 */
app.get(`${R}/rescuer-directory`, async (c) => {
  try {
    const directory = await kv.getByPrefix(TABLE.RESCUER_DIRECTORY);
    const sorted = (directory as any[]).sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
    return c.json({ data: sorted });
  } catch (err: any) {
    console.error('Error fetching rescuer_directory table:', err);
    return c.json({ error: `Failed to fetch rescuer directory: ${err.message}` }, 500);
  }
});

// ── RESCUER ASSIGNMENT table (/assignments) ───────────────────────────────

/**
 * GET /assignments
 * Returns all records from the rescuer_assignment table.
 */
app.get(`${R}/assignments`, async (c) => {
  try {
    const assignments = await kv.getByPrefix(TABLE.RESCUER_ASSIGNMENT);
    const sorted = (assignments as any[]).sort(
      (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );
    return c.json({ data: sorted });
  } catch (err: any) {
    console.error('Error fetching rescuer_assignment table:', err);
    return c.json({ error: `Failed to fetch assignments: ${err.message}` }, 500);
  }
});

// ── HELPER SUBMITTED table (/helper-submissions) ──────────────────────────

/**
 * GET /helper-submissions
 * Returns all records from the helper_submitted table.
 */
app.get(`${R}/helper-submissions`, async (c) => {
  try {
    const submissions = await kv.getByPrefix(TABLE.HELPER_SUBMITTED);
    const sorted = (submissions as any[]).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    return c.json({ data: sorted });
  } catch (err: any) {
    console.error('Error fetching helper_submitted table:', err);
    return c.json({ error: `Failed to fetch submissions: ${err.message}` }, 500);
  }
});

// ── AUTH (/auth) ───────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Verifies credentials against the auth namespace and returns the rescuer profile
 * from the rescuer_register table.
 */
app.post(`${R}/auth/login`, async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const authData = await kv.get(`${TABLE.AUTH}${email}`) as any;
    if (!authData) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const passwordHash = await hashPassword(password);
    if (authData.passwordHash !== passwordHash) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Fetch the profile from the rescuer_register table
    const rescuers = await kv.getByPrefix(TABLE.RESCUER_REGISTER) as any[];
    const profile = rescuers.find(r => r.email === email);
    if (!profile) {
      return c.json({ error: 'Rescuer profile not found in rescuer_register table' }, 404);
    }

    console.log(`✅ Auth: login successful for ${email} (rescuer_register[${profile.id}])`);
    return c.json({
      data: {
        user:    { id: authData.userId, email },
        profile, // full rescuer_register record
      },
    });
  } catch (err: any) {
    console.error('Error during auth/login:', err);
    return c.json({ error: `Login failed: ${err.message}` }, 500);
  }
});

Deno.serve(app.fetch);
