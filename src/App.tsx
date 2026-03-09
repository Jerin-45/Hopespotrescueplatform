import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RescuerAuth } from './components/RescuerAuth';
import { AdminLogin } from './components/AdminLogin';
import { DataProvider, useData } from './context/DataContext';
import { projectId, publicAnonKey } from './utils/supabase/info';

// ── Server API config ─────────────────────────────────────────────────────────
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

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

// ── App Content ───────────────────────────────────────────────────────────────
function AppContent() {
  const [currentRole, setCurrentRole]                       = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated]     = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName]         = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail]       = useState('');
  const [currentRescuerId, setCurrentRescuerId]             = useState('');
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

  /**
   * handleRescuerLogin
   * Calls POST /auth/login on the server.
   * The server verifies credentials against the auth namespace and returns the
   * matching profile from the rescuer_register table.
   */
  const handleRescuerLogin = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; name?: string; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method:  'POST',
        headers: HEADERS,
        body:    JSON.stringify({ email: identifier, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('Login error from server:', result.error);
        return { success: false, error: result.error || 'Invalid email or password' };
      }

      const { profile } = result.data;
      setIsRescuerAuthenticated(true);
      setCurrentRescuerName(profile.name || '');
      setCurrentRescuerEmail(profile.email);
      setCurrentRescuerId(profile.id);
      setCurrentRescuerDisplayId(profile.badge_id || profile.displayId || '');
      setCurrentRole('rescuer');
      return { success: true, name: profile.name };
    } catch (err) {
      console.error('Login network/parse error:', err);
      return { success: false, error: 'Login error. Please try again.' };
    }
  };

  /**
   * handleRescuerRegister
   * Calls POST /rescuers on the server.
   * The server writes to:
   *   • rescuer_register table
   *   • rescuer_directory table
   *   • auth namespace (hashed password)
   */
  const handleRescuerRegister = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/rescuers`, {
        method:  'POST',
        headers: HEADERS,
        body:    JSON.stringify({ email, password, name, phone, address }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('Registration error from server:', result.error);
        return { success: false, error: result.error || 'Registration failed' };
      }

      console.log('✅ Rescuer registered:', result.data?.id, '| badge:', result.data?.badge_id);
      await refreshData();
      return { success: true };
    } catch (err) {
      console.error('Registration network/parse error:', err);
      return { success: false, error: 'Registration error. Please try again.' };
    }
  };

  // ── Routing ─────────────────────────────────────────────────────────────────

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
