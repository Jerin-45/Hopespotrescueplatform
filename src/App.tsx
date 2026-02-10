import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { RescuerAuth } from './components/RescuerAuth';
import { ReportDashboard } from './components/ReportDashboard';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

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
  rejectedBy?: string[]; // Track rescuers who rejected this case
  rejectionReasons?: { rescuerId: string; rescuerName: string; reason: string; timestamp: string }[]; // Track rejection reasons
}

export interface RescuerAccount {
  id: string;
  email: string;
  password?: string; // Not stored in frontend for new auth, but kept for type compatibility if needed
  name?: string;
  phone?: string;
  address?: string;
  registeredAt: string;
  altPhone?: string;
  profileComplete?: boolean;
  displayId?: string;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName] = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail] = useState('');
  const [currentRescuerId, setCurrentRescuerId] = useState('');
  const [currentRescuerDisplayId, setCurrentRescuerDisplayId] = useState('');
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [rescuers, setRescuers] = useState<RescuerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from server
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Requests
      const reqResponse = await fetch(`${SERVER_URL}/requests`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (reqResponse.ok) {
        const requestsData = await reqResponse.json();
        setRescueRequests(requestsData || []);
      }

      // Fetch Rescuers
      const rescuerResponse = await fetch(`${SERVER_URL}/rescuers`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      if (rescuerResponse.ok) {
        const rescuersData = await rescuerResponse.json();
        setRescuers(rescuersData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    // Refresh data when switching roles to ensure fresh state
    if (role) fetchData();
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
      supabase.auth.signOut();
    }
  };

  const handleAdminLogin = (adminId: string, password: string) => {
    // Simple authentication check - in production, this would be server-side
    if (adminId === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
      // Refresh rescuers list for admin
      fetchData();
      return true;
    }
    return false;
  };

  const handleRescuerLogin = async (identifier: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Find the rescuer profile
        // We need to fetch the latest rescuers list to be sure
        const rescuerResponse = await fetch(`${SERVER_URL}/rescuers`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        const allRescuers: RescuerAccount[] = await rescuerResponse.json();
        
        const rescuer = allRescuers.find(r => r.id === data.user!.id);
        
        if (rescuer) {
          setIsRescuerAuthenticated(true);
          setCurrentRescuerName(rescuer.name || '');
          setCurrentRescuerEmail(rescuer.email);
          setCurrentRescuerId(rescuer.id);
          setCurrentRescuerDisplayId(rescuer.displayId || '');
          setCurrentRole('rescuer');
          return { success: true, name: rescuer.name };
        } else {
            // Profile missing?
            return { success: false, error: 'Rescuer profile not found' };
        }
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error during login' };
    }
  };

  const handleRescuerRegister = async (email: string, password: string, name: string, phone: string, address: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name, phone, address })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases if needed
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error during registration' };
    }
  };

  const addRescueRequest = async (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => {
    const generatedTrackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newRequest: RescueRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      trackingId: generatedTrackingId,
    };

    try {
      const response = await fetch(`${SERVER_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        setRescueRequests([newRequest, ...rescueRequests]);
      } else {
        console.error('Failed to save request');
        alert('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Error saving request:', err);
      alert('Error submitting request. Please check your connection.');
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: { 
      rescuerId: string; 
      assignedRescuer: string; 
      rescuerNotes?: string; 
      trackingId?: string; 
      rejectedBy?: string[];
      rejectionReasons?: { rescuerId: string; rescuerName: string; reason: string; timestamp: string }[];
    }
  ) => {
    // Optimistic update
    const previousRequests = [...rescueRequests];
    const updatedRequests = rescueRequests.map((req) =>
      req.id === id
        ? { ...req, status, ...rescuerData }
        : req
    );
    setRescueRequests(updatedRequests);

    const updatedRequest = updatedRequests.find(r => r.id === id);

    if (updatedRequest) {
      try {
        const response = await fetch(`${SERVER_URL}/requests/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(updatedRequest)
        });

        if (!response.ok) {
          throw new Error('Failed to update');
        }
      } catch (err) {
        console.error('Error updating status:', err);
        // Revert on error
        setRescueRequests(previousRequests);
        alert('Failed to update status. Please check your connection.');
      }
    }
  };

  if (!currentRole) {
    return <LandingPage onRoleSelect={handleRoleSelect} />;
  }

  if (currentRole === 'helper') {
    return (
      <HelperDashboard
        onBack={handleBack}
        onSubmitRequest={addRescueRequest}
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
