import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Logger
app.use('*', logger(console.log));

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

const ROUTE_PREFIX = '/make-server-12d090c6';

// Health check
app.get(`${ROUTE_PREFIX}/health`, (c) => c.json({ status: 'ok' }));

// Get value by key
app.get(`${ROUTE_PREFIX}/kv/:key`, async (c) => {
  const key = c.req.param('key');
  try {
    const value = await kv.get(key);
    return c.json({ value });
  } catch (err) {
    console.error(`Error getting key ${key}:`, err);
    return c.json({ error: err.message }, 500);
  }
});

// Set value by key
app.post(`${ROUTE_PREFIX}/kv/:key`, async (c) => {
  const key = c.req.param('key');
  try {
    const body = await c.req.json();
    await kv.set(key, body.value);
    return c.json({ success: true });
  } catch (err) {
    console.error(`Error setting key ${key}:`, err);
    return c.json({ error: err.message }, 500);
  }
});

// Get values by prefix
app.get(`${ROUTE_PREFIX}/kv/prefix/:prefix`, async (c) => {
  const prefix = c.req.param('prefix');
  try {
    const values = await kv.getByPrefix(prefix);
    return c.json({ values });
  } catch (err) {
    console.error(`Error getting prefix ${prefix}:`, err);
    return c.json({ error: err.message }, 500);
  }
});

// Delete value by key
app.delete(`${ROUTE_PREFIX}/kv/:key`, async (c) => {
  const key = c.req.param('key');
  try {
    await kv.del(key);
    return c.json({ success: true });
  } catch (err) {
    console.error(`Error deleting key ${key}:`, err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);
