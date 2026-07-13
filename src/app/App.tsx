import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RescuerAuth } from './components/RescuerAuth';
import { AdminLogin } from './components/AdminLogin';
import { DataProvider, useData, lsGet, lsSet, LS } from './context/DataContext';

// ── Types ─────────────────────────────────────────────────────────────────────
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
  rejectionReasons?: {
    rescuerId: string;
    rescuerName: string;
    reason: string;
    timestamp: string;
  }[];
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

// ── Auth helpers (localStorage + SHA-256) ─────────────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthRecord {
  userId:       string;
  email:        string;
  passwordHash: string;
  createdAt:    string;
}

async function authLogin(
  email: string,
  password: string
): Promise<{ success: boolean; profile?: RescuerAccount; error?: string }> {
  const authMap = lsGet<Record<string, AuthRecord>>(LS.AUTH, {});
  const auth    = authMap[email.toLowerCase()];
  if (!auth) return { success: false, error: 'Invalid email or password' };

  const hash = await hashPassword(password);
  if (auth.passwordHash !== hash) return { success: false, error: 'Invalid email or password' };

  const rescuers = lsGet<RescuerAccount[]>(LS.RESCUERS, []);
  const profile  = rescuers.find(r => r.id === auth.userId);
  if (!profile) return { success: false, error: 'Rescuer profile not found' };

  return { success: true, profile };
}

async function authRegister(
  email: string,
  password: string,
  name: string,
  phone: string,
  address: string
): Promise<{ success: boolean; error?: string }> {
  const authMap = lsGet<Record<string, AuthRecord>>(LS.AUTH, {});
  if (authMap[email.toLowerCase()]) return { success: false, error: 'Email already registered' };

  const id          = crypto.randomUUID();
  const badge_id    = `RSC-${Math.floor(1000 + Math.random() * 9000)}`;
  const passwordHash = await hashPassword(password);
  const now         = new Date().toISOString();

  // auth namespace
  authMap[email.toLowerCase()] = { userId: id, email, passwordHash, createdAt: now };
  lsSet(LS.AUTH, authMap);

  // rescuer_register record
  const rescuerRecord: RescuerAccount = {
    id, email, name, phone, address, badge_id,
    displayId:       badge_id,
    registeredAt:    now,
    profileComplete: true,
  };
  const rescuers = lsGet<RescuerAccount[]>(LS.RESCUERS, []);
  lsSet(LS.RESCUERS, [rescuerRecord, ...rescuers]);

  // rescuer_directory record (public fields only)
  const directory = lsGet<any[]>(LS.DIRECTORY, []);
  lsSet(LS.DIRECTORY, [{ id, name, email, phone, address, badge_id, displayId: badge_id, registeredAt: now }, ...directory]);

  return { success: true };
}

// ── App Content ───────────────────────────────────────────────────────────────
function AppContent() {
  const [currentRole, setCurrentRole]                         = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated]       = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated]   = useState(false);
  const [currentRescuerName, setCurrentRescuerName]           = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail]         = useState('');
  const [currentRescuerId, setCurrentRescuerId]               = useState('');
  const [currentRescuerDisplayId, setCurrentRescuerDisplayId] = useState('');

  const { rescueRequests, rescuers, refreshData, addRescueRequest, updateRequestStatus } =
    useData();

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

  const handleRescuerLogin = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; name?: string; error?: string }> => {
    const result = await authLogin(identifier, password);
    if (!result.success) return { success: false, error: result.error };

    const p = result.profile!;
    setIsRescuerAuthenticated(true);
    setCurrentRescuerName(p.name || '');
    setCurrentRescuerEmail(p.email);
    setCurrentRescuerId(p.id);
    setCurrentRescuerDisplayId(p.badge_id || p.displayId || '');
    setCurrentRole('rescuer');
    return { success: true, name: p.name };
  };

  const handleRescuerRegister = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await authRegister(email, password, name, phone, address);
    if (result.success) refreshData();
    return result;
  };

  // ── Routing ──────────────────────────────────────────────────────────────────

  if (!currentRole) return <LandingPage onRoleSelect={handleRoleSelect} />;

  if (currentRole === 'helper') {
    return (
      <HelperDashboard
        onBack={handleBack}
        onSubmitRequest={async (req) => {
          const success = await addRescueRequest(req);
          if (!success) alert('Failed to submit request. Please try again.');
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

// ── Root export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
