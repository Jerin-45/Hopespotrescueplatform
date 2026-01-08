import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { HelperDashboard } from './components/HelperDashboard';
import { RescuerDashboard } from './components/RescuerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { RescuerAuth } from './components/RescuerAuth';
import { ReportDashboard } from './components/ReportDashboard';

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
}

export interface RescuerAccount {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
  registeredAt: string;
  altPhone?: string;
  profileComplete?: boolean;
}

const STORAGE_KEY = 'hopespot_rescue_requests';
const RESCUERS_STORAGE_KEY = 'hopespot_rescuers';

// Load rescuers from localStorage
const getStoredRescuers = (): RescuerAccount[] => {
  try {
    const stored = localStorage.getItem(RESCUERS_STORAGE_KEY);
    if (stored) {
      const parsedRescuers = JSON.parse(stored);
      // Check if all rescuers have the 'id' field - if not, reset to defaults
      const allHaveIds = parsedRescuers.every((r: any) => r.id);
      if (allHaveIds) {
        return parsedRescuers;
      }
      // Clear old data and use defaults
      localStorage.removeItem(RESCUERS_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error loading rescuers from localStorage:', error);
  }
  
  // Return 6 pre-registered rescuers if nothing in storage
  return [
    {
      id: 'jerin-r1',
      email: 'rescuer1@hopespot.com',
      password: 'rescue123',
      name: 'Jerin',
      phone: '+1234567801',
      address: '123 Oak Street, Downtown District',
      registeredAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'kumar-r2',
      email: 'rescuer2@hopespot.com',
      password: 'rescue456',
      name: 'Kumar',
      phone: '+1234567802',
      address: '456 Elm Avenue, North Side',
      registeredAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    },
    {
      id: 'james-r3',
      email: 'rescuer3@hopespot.com',
      password: 'rescue789',
      name: 'James',
      phone: '+1234567803',
      address: '789 Pine Road, East End',
      registeredAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: 'emily-r4',
      email: 'rescuer4@hopespot.com',
      password: 'rescue321',
      name: 'Emily',
      phone: '+1234567804',
      address: '321 Maple Lane, West Hills',
      registeredAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'david-r5',
      email: 'rescuer5@hopespot.com',
      password: 'rescue654',
      name: 'David',
      phone: '+1234567805',
      address: '654 Cedar Boulevard, South Valley',
      registeredAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'lisa-r6',
      email: 'rescuer6@hopespot.com',
      password: 'rescue987',
      name: 'Lisa',
      phone: '+1234567806',
      address: '987 Birch Street, Central Park Area',
      registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];
};

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
      assignedRescuer: 'JERIN-R1',
      rescuerId: 'jerin-r1',
    },
  ];
};

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isRescuerAuthenticated, setIsRescuerAuthenticated] = useState(false);
  const [currentRescuerName, setCurrentRescuerName] = useState('');
  const [currentRescuerEmail, setCurrentRescuerEmail] = useState('');
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>(getInitialRequests());
  const [rescuers, setRescuers] = useState<RescuerAccount[]>(getStoredRescuers());

  // Save to localStorage whenever requests change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rescueRequests));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [rescueRequests]);

  // Save rescuers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(RESCUERS_STORAGE_KEY, JSON.stringify(rescuers));
    } catch (error) {
      console.error('Error saving rescuers to localStorage:', error);
    }
  }, [rescuers]);

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
      setCurrentRescuerEmail('');
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

  const handleRescuerLogin = (identifier: string, password: string) => {
    const rescuer = rescuers.find(
      (r) => r.email.toLowerCase() === identifier.toLowerCase() && r.password === password
    );

    if (rescuer) {
      setIsRescuerAuthenticated(true);
      setCurrentRescuerName(rescuer.name || '');
      setCurrentRescuerEmail(rescuer.email);
      setCurrentRole('rescuer');
      return { success: true, name: rescuer.name };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const handleRescuerRegister = (email: string, password: string, name: string, phone: string, address: string) => {
    // Check if email already exists
    const existingRescuer = rescuers.find(
      (r) => r.email.toLowerCase() === email.toLowerCase()
    );

    if (existingRescuer) {
      return { success: false, error: 'Email already registered' };
    }

    const newRescuer: RescuerAccount = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password,
      name,
      phone,
      address,
      registeredAt: new Date().toISOString(),
    };

    setRescuers([...rescuers, newRescuer]);
    return { success: true };
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
    rescuerData?: { rescuerId: string; assignedRescuer: string; rescuerNotes?: string; trackingId?: string; rejectedBy?: string[] }
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

  const handleAddRescuer = (rescuer: RescuerAccount) => {
    // Check if rescuer ID already exists
    const existingRescuer = rescuers.find(
      (r) => r.id.toLowerCase() === rescuer.id.toLowerCase()
    );
    
    if (existingRescuer) {
      return { success: false, error: 'Rescuer ID already exists' };
    }

    // Check if email already exists
    const existingEmail = rescuers.find(
      (r) => r.email.toLowerCase() === rescuer.email.toLowerCase()
    );
    
    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    setRescuers([...rescuers, rescuer]);
    return { success: true };
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