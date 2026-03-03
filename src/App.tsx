import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { RescuerAuth } from './components/RescuerAuth';
import { AdminLogin } from './components/AdminLogin';
import { DataProvider, useData } from './context/DataContext';
import { serverApi } from './utils/server-api';
import { authService } from './utils/auth';

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

function AppContent() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName] = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail] = useState('');
  const [currentRescuerId, setCurrentRescuerId] = useState('');
  const [currentRescuerDisplayId, setCurrentRescuerDisplayId] = useState('');

  const { rescueRequests, rescuers, loading, refreshData, addRescueRequest, updateRequestStatus } = useData();

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    if (role) refreshData();
  };

  const handleBack = () => {
    setCurrentRole(null);
    if (currentRole === 'admin') {
      setIsAdminAuthenticated(false);
    }
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

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Find rescuer profile in the list from context
        const rescuerData = rescuers.find(r => r.email === identifier);
        
        if (!rescuerData) {
          return { success: false, error: 'Rescuer profile not found in server KV store' };
        }
        
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
      return { success: false, error: 'Network error during login' };
    }
  };

  const handleRescuerRegister = async (email: string, password: string, name: string, phone: string, address: string) => {
    try {
      const { data: authData, error: authError } = await authService.signUp(email, password, { name });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData?.user) {
        const id = crypto.randomUUID();
        const badge_id = `RSC-${Math.floor(1000 + Math.random() * 9000)}`;
        const key = `rescuer:${id}`;
        
        const profile: RescuerAccount = {
          id,
          auth_user_id: authData.user.id,
          name,
          email,
          phone,
          address,
          badge_id,
          registeredAt: new Date().toISOString(),
          profileComplete: true
        };

        // Create rescuer profile using server API
        try {
          await serverApi.set(key, profile);
          await refreshData();
          return { success: true };
        } catch (serverError: any) {
          console.error('Profile creation error via server:', serverError);
          return { success: false, error: serverError.message };
        }
      }

      return { success: false, error: 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error during registration' };
    }
  };

  if (!currentRole) {
    return <LandingPage onRoleSelect={handleRoleSelect} />;
  }

  if (currentRole === 'helper') {
    return (
      <HelperDashboard
        onBack={handleBack}
        onSubmitRequest={async (req) => {
          const success = await addRescueRequest(req);
          if (!success) alert('Failed to submit request via server');
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