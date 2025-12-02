import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { RescuerLogin } from './components/RescuerLogin';

export type UserRole = 'helper' | 'rescuer' | 'admin' | null;

export interface RescueRequest {
  id: string;
  helperName: string;
  helperPhone: string;
  location: string;
  photoUrl?: string;
  notes: string;
  status: 'pending' | 'assigned' | 'on-the-way' | 'reached' | 'completed';
  timestamp: string;
  assignedRescuer?: string;
  rescuerId?: string;
  rescuerNotes?: string;
}

const STORAGE_KEY = 'hopespot_rescue_requests';

// Load initial data from localStorage or use demo data
const getInitialRequests = (): RescueRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  // Return demo data if nothing in storage
  return [
    {
      id: '1',
      helperName: 'John Smith',
      helperPhone: '+1234567890',
      location: 'Highway 101, Mile Marker 45',
      notes: 'Elderly person sitting by the roadside, looks dehydrated',
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      helperName: 'Sarah Johnson',
      helperPhone: '+1234567891',
      location: 'Main Street & Oak Avenue',
      notes: 'Person with injured leg, needs immediate assistance',
      status: 'assigned',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      assignedRescuer: 'Mike Davis',
      rescuerId: 'r1',
    },
  ];
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName] = useState('');
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>(getInitialRequests());

  // Save to localStorage whenever requests change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rescueRequests));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [rescueRequests]);

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleBack = () => {
    setCurrentRole(null);
    if (currentRole === 'admin') {
      setIsAdminAuthenticated(false);
    }
    if (currentRole === 'rescuer') {
      setIsRescuerAuthenticated(false);
      setCurrentRescuerName('');
    }
  };

  const handleAdminLogin = (adminId: string, password: string) => {
    // Simple authentication check - in production, this would be server-side
    if (adminId === 'admin' && password === 'admin123') {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
      return true;
    }
    return false;
  };

  const handleRescuerLogin = (rescuerId: string, password: string) => {
    // Simple authentication check - in production, this would be server-side with proper credentials
    const rescuerAccounts = [
      { id: 'rescuer1', password: 'rescue123', name: 'Mike Davis' },
      { id: 'rescuer2', password: 'rescue123', name: 'Sarah Williams' },
    ];

    const rescuer = rescuerAccounts.find(
      (acc) => acc.id === rescuerId && acc.password === password
    );

    if (rescuer) {
      setIsRescuerAuthenticated(true);
      setCurrentRescuerName(rescuer.name);
      setCurrentRole('rescuer');
      return true;
    }
    return false;
  };

  const addRescueRequest = (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => {
    const newRequest: RescueRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setRescueRequests([newRequest, ...rescueRequests]);
  };

  const updateRequestStatus = (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: { rescuerId: string; assignedRescuer: string; rescuerNotes?: string }
  ) => {
    setRescueRequests(
      rescueRequests.map((req) =>
        req.id === id
          ? { ...req, status, ...rescuerData }
          : req
      )
    );
  };

  const clearAllData = () => {
    setRescueRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const importData = (data: RescueRequest[]) => {
    setRescueRequests(data);
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
      return <RescuerLogin onLogin={handleRescuerLogin} onBack={handleBack} />;
    }
    return (
      <RescuerDashboard
        onBack={handleBack}
        requests={rescueRequests}
        onUpdateStatus={updateRequestStatus}
        rescuerName={currentRescuerName}
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
        onClearData={clearAllData}
        onImportData={importData}
      />
    );
  }

  return null;
}
