import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const BASE_PATH = "/make-server-12d090c6";

// Global error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get(`${BASE_PATH}/health`, (c) => {
  return c.json({ status: "ok" });
});

// --- Requests ---

app.get(`${BASE_PATH}/requests`, async (c) => {
  try {
    const requests = await kv.getByPrefix("req_");
    // Remove the prefix from the keys if needed, but getByPrefix returns values array? 
    // kv_store.tsx description: "mget and getByPrefix return an array of values."
    // So we just return the values.
    return c.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return c.json({ error: "Failed to fetch requests" }, 500);
  }
});

app.post(`${BASE_PATH}/requests`, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.id) {
      return c.json({ error: "ID is required" }, 400);
    }
    await kv.set(`req_${body.id}`, body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.error("Error creating request:", error);
    return c.json({ error: "Failed to create request" }, 500);
  }
});

app.put(`${BASE_PATH}/requests/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    // Ensure the ID in body matches the URL param (or set it)
    const updatedRequest = { ...body, id };
    
    await kv.set(`req_${id}`, updatedRequest);
    return c.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error updating request:", error);
    return c.json({ error: "Failed to update request" }, 500);
  }
});

// --- Rescuers ---

app.get(`${BASE_PATH}/rescuers`, async (c) => {
  try {
    const rescuers = await kv.getByPrefix("rescuer_");
    return c.json(rescuers);
  } catch (error) {
    console.error("Error fetching rescuers:", error);
    return c.json({ error: "Failed to fetch rescuers" }, 500);
  }
});

app.post(`${BASE_PATH}/rescuers`, async (c) => {
  try {
    const body = await c.req.json();
    if (!body.id) {
      return c.json({ error: "ID is required" }, 400);
    }
    await kv.set(`rescuer_${body.id}`, body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.error("Error creating rescuer profile:", error);
    return c.json({ error: "Failed to create rescuer profile" }, 500);
  }
});

// --- Auth ---

app.post(`${BASE_PATH}/signup`, async (c) => {
  try {
    const { email, password, name, phone, address } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Automatically confirm email
    });

    if (error) {
      // Check for email exists error code (can vary slightly by version/API)
      // The provided error object has code: "email_exists"
      // @ts-ignore
      if (error.code === "email_exists" || error.message?.includes("already been registered")) {
        console.warn("Signup attempt for existing email:", email);
        return c.json({ error: "A user with this email address has already been registered" }, 409);
      }
      
      console.error("Supabase auth error:", error);
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      // Create rescuer profile in KV store
      // We use the Auth User ID as the profile ID for consistency
      const rescuerProfile = {
        id: data.user.id,
        email,
        name,
        phone,
        address,
        registeredAt: new Date().toISOString(),
        // Add a "display ID" or similar if needed to match legacy "jerin-r1" style
        // For now, we'll generate one or just use the UUID. 
        // Let's generate a friendly ID for the Admin UI if not provided.
        displayId: `R-${data.user.id.substring(0, 6).toUpperCase()}`
      };

      await kv.set(`rescuer_${data.user.id}`, rescuerProfile);
      
      return c.json({ success: true, user: data.user, profile: rescuerProfile });
    }

    return c.json({ error: "User creation failed without error" }, 500);

  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

Deno.serve(async (req) => {
  try {
    return await app.fetch(req);
  } catch (error) {
    console.error("Critical server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
