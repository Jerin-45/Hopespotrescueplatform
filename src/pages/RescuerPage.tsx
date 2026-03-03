import { useState } from "react";
import { useNavigate } from "react-router";
import { RescuerDashboard } from "../components/RescuerDashboard";
import { RescuerAuth } from "../components/RescuerAuth";
import { useData } from "../context/DataContext";
import { RescuerAccount } from "../App";

// ── Inline localStorage helper ─────────────────────────────────────────────
const ls = {
  get(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("localStorage write error:", err);
      throw err;
    }
  },
  getByPrefix(prefix: string): any[] {
    try {
      const results: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const item = localStorage.getItem(key);
          if (item) results.push(JSON.parse(item));
        }
      }
      return results;
    } catch {
      return [];
    }
  },
};

// ── Inline auth helpers (SHA-256) ──────────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

let _session: { userId: string; email: string } | null = null;

const authService = {
  async signUp(email: string, password: string) {
    try {
      const existing = (ls.getByPrefix("rescuer:") as RescuerAccount[]).find(
        (r) => r.email === email
      );
      if (existing)
        return { data: null, error: { message: "User already exists" } };

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);
      ls.set(`auth:${email}`, {
        userId,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
      _session = { userId, email };
      return { data: { user: { id: userId, email } }, error: null };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message || "Registration failed" },
      };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const authData = ls.get(`auth:${email}`);
      if (!authData)
        return {
          data: null,
          error: { message: "Invalid email or password" },
        };

      const passwordHash = await hashPassword(password);
      if (authData.passwordHash !== passwordHash)
        return {
          data: null,
          error: { message: "Invalid email or password" },
        };

      _session = { userId: authData.userId, email: authData.email };
      return {
        data: { user: { id: authData.userId, email: authData.email } },
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: { message: err.message || "Login failed" },
      };
    }
  },

  signOut() {
    _session = null;
    return Promise.resolve();
  },
};
// ───────────────────────────────────────────────────────────────────────────

export function RescuerPage() {
  const navigate = useNavigate();
  const { rescueRequests, updateRequestStatus, rescuers, refreshData } =
    useData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRescuer, setCurrentRescuer] = useState<{
    name: string;
    email: string;
    id: string;
    displayId: string;
  } | null>(null);

  const handleBack = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setCurrentRescuer(null);
      authService.signOut();
    } else {
      navigate("/");
    }
  };

  const handleLogin = async (identifier: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(identifier, password);
      if (error) return { success: false, error: error.message };

      if (data?.user) {
        const profile = rescuers.find((r) => r.email === identifier);
        if (!profile)
          return { success: false, error: "Rescuer profile not found" };

        setIsAuthenticated(true);
        setCurrentRescuer({
          name: profile.name || "",
          email: profile.email,
          id: profile.id,
          displayId: profile.badge_id || "",
        });
        return { success: true, name: profile.name };
      }
      return { success: false, error: "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error" };
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: string
  ) => {
    try {
      const { data: authData, error: authError } = await authService.signUp(
        email,
        password
      );
      if (authError) return { success: false, error: authError.message };

      if (authData?.user) {
        const id = crypto.randomUUID();
        const badge_id = `RSC-${Math.floor(1000 + Math.random() * 9000)}`;

        const profile: RescuerAccount = {
          id,
          auth_user_id: authData.user.id,
          name,
          email,
          phone,
          address,
          badge_id,
          registeredAt: new Date().toISOString(),
          profileComplete: true,
        };

        ls.set(`rescuer:${id}`, profile);
        await refreshData();
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  if (!isAuthenticated) {
    return (
      <RescuerAuth
        onLogin={handleLogin}
        onRegister={handleRegister}
        onBack={handleBack}
      />
    );
  }

  return (
    <RescuerDashboard
      onBack={handleBack}
      requests={rescueRequests}
      onUpdateStatus={updateRequestStatus}
      rescuerName={currentRescuer?.name || ""}
      rescuerEmail={currentRescuer?.email || ""}
      rescuerId={currentRescuer?.id || ""}
      rescuerDisplayId={currentRescuer?.displayId || ""}
    />
  );
}
