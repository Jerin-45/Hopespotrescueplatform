import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RescuerAuth } from './components/RescuerAuth';
import { AdminLogin } from './components/AdminLogin';
import { DataProvider, useData } from './context/DataContext';

// ── Types ──────────────────────────────────────────────────────────────────
export type UserRole = 'helper' | 'rescuer' | 'admin' | null;

export interface RescueRequest {
  id: string;
  helperName: string;
  helperPhone: string;
  helperAltPhone?: string;
  helperEmail?: string;
  location: string;
  photoUrl?: string;
  notes: string;
  status: 'pending' | 'assigned' | 'accepted' | 'on-the-way' | 'reached' | 'completed';
  timestamp: string;
  assignedRescuer?: string;
  rescuerId?: string;
  rescuerNotes?: string;
  trackingId?: string;
  rejectedBy?: string[];
  rejectionReasons?: { rescuerId: string; rescuerName: string; reason: string; timestamp: string }[];
  lastModified: string;
  modifiedBy?: string;
}

export interface RescuerAccount {
  id: string;
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  address?: string;
  registeredAt: string;
  altPhone?: string;
  profileComplete?: boolean;
  displayId?: string;
  auth_user_id?: string;
  badge_id?: string;
}

// ── Inline localStorage helpers ────────────────────────────────────────────
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
      console.error('localStorage write error:', err);
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

// ── Inline auth helpers (SHA-256, no external deps) ──────────────────��────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let currentSession: { userId: string; email: string } | null = null;

const authService = {
  async signUp(email: string, password: string) {
    try {
      const existing = (ls.getByPrefix('rescuer:') as RescuerAccount[]).find(r => r.email === email);
      if (existing) return { data: null, error: { message: 'User already exists' } };

      const userId = crypto.randomUUID();
      const passwordHash = await hashPassword(password);

      ls.set(`auth:${email}`, { userId, email, passwordHash, createdAt: new Date().toISOString() });
      currentSession = { userId, email };

      return { data: { user: { id: userId, email } }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Registration failed' } };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const authData = ls.get(`auth:${email}`);
      if (!authData) return { data: null, error: { message: 'Invalid email or password' } };

      const passwordHash = await hashPassword(password);
      if (authData.passwordHash !== passwordHash)
        return { data: null, error: { message: 'Invalid email or password' } };

      currentSession = { userId: authData.userId, email: authData.email };
      return { data: { user: { id: authData.userId, email: authData.email } }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Login failed' } };
    }
  },

  signOut() {
    currentSession = null;
    return Promise.resolve();
  },

  getSession() {
    return currentSession;
  },
};
// ───────────────────────────────────────────────────────────────────────────

function AppContent() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName] = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail] = useState('');
  const [currentRescuerId, setCurrentRescuerId] = useState('');
  const [currentRescuerDisplayId, setCurrentRescuerDisplayId] = useState('');

  const { rescueRequests, rescuers, refreshData, addRescueRequest, updateRequestStatus } = useData();

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    if (role) refreshData();
  };

  const handleBack = () => {
    setCurrentRole(null);
    if (currentRole === 'admin') setIsAdminAuthenticated(false);
    if (currentRole === 'rescuer') {
      setIsRescuerAuthenticated(false);
      setCurrentRescuerName('');
      setCurrentRescuerEmail('');
      setCurrentRescuerId('');
      setCurrentRescuerDisplayId('');
      authService.signOut();
    }
  };

  const handleAdminLogin = (adminId: string, password: string) => {
    if (adminId === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
      refreshData();
      return true;
    }
    return false;
  };

  const handleRescuerLogin = async (identifier: string, password: string) => {
    try {
      const { data, error } = await authService.signIn(identifier, password);
      if (error) return { success: false, error: error.message };

      if (data?.user) {
        const rescuerData = rescuers.find(r => r.email === identifier);
        if (!rescuerData) return { success: false, error: 'Rescuer profile not found' };

        setIsRescuerAuthenticated(true);
        setCurrentRescuerName(rescuerData.name || '');
        setCurrentRescuerEmail(rescuerData.email);
        setCurrentRescuerId(rescuerData.id);
        setCurrentRescuerDisplayId(rescuerData.badge_id || '');
        setCurrentRole('rescuer');
        return { success: true, name: rescuerData.name };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login error' };
    }
  };

  const handleRescuerRegister = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: string
  ) => {
    try {
      const { data: authData, error: authError } = await authService.signUp(email, password);
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

        try {
          ls.set(`rescuer:${id}`, profile);
          await refreshData();
          return { success: true };
        } catch (storageError: any) {
          return { success: false, error: storageError.message };
        }
      }

      return { success: false, error: 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Registration error' };
    }
  };

  if (!currentRole) return <LandingPage onRoleSelect={handleRoleSelect} />;

  if (currentRole === 'helper') {
    return (
      <HelperDashboard
        onBack={handleBack}
        onSubmitRequest={async (req) => {
          const success = await addRescueRequest(req);
          if (!success) alert('Failed to submit request');
        }}
        requests={rescueRequests}
      />
    );
  }

  if (currentRole === 'rescuer') {
    if (!isRescuerAuthenticated) {
      return (
        <RescuerAuth
          onLogin={handleRescuerLogin}
          onRegister={handleRescuerRegister}
          onBack={handleBack}
        />
      );
    }
    return (
      <RescuerDashboard
        onBack={handleBack}
        requests={rescueRequests}
        onUpdateStatus={updateRequestStatus}
        rescuerName={currentRescuerName}
        rescuerEmail={currentRescuerEmail}
        rescuerId={currentRescuerId}
        rescuerDisplayId={currentRescuerDisplayId}
      />
    );
  }

  if (currentRole === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLogin onLogin={handleAdminLogin} onBack={handleBack} />;
    }
    return (
      <AdminDashboard
        onBack={handleBack}
        requests={rescueRequests}
        onUpdateStatus={updateRequestStatus}
        rescuers={rescuers}
      />
    );
  }

  return null;
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
