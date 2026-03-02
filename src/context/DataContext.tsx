import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RescueRequest, RescuerAccount } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DataContextType {
  rescueRequests: RescueRequest[];
  rescuers: RescuerAccount[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addRescueRequest: (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => Promise<boolean>;
  updateRequestStatus: (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;

export function DataProvider({ children }: { children: ReactNode }) {
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [rescuers, setRescuers] = useState<RescuerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqResponse, rescuerResponse] = await Promise.all([
        fetch(`${SERVER_URL}/requests`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${SERVER_URL}/rescuers`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      if (reqResponse.ok) {
        const requestsData = await reqResponse.json();
        console.log('✅ Requests loaded:', requestsData.length || 0);
        setRescueRequests(requestsData || []);
      } else {
        console.warn('⚠️ Requests fetch returned non-OK status:', reqResponse.status);
        // Try to get the body anyway - server may return empty array on error
        try {
          const data = await reqResponse.json();
          setRescueRequests(Array.isArray(data) ? data : []);
        } catch {
          setRescueRequests([]);
        }
      }

      if (rescuerResponse.ok) {
        const rescuersData = await rescuerResponse.json();
        console.log('✅ Rescuers loaded:', rescuersData.length || 0);
        setRescuers(rescuersData || []);
      } else {
        console.warn('⚠️ Rescuers fetch returned non-OK status:', rescuerResponse.status);
        // Try to get the body anyway - server may return empty array on error
        try {
          const data = await rescuerResponse.json();
          setRescuers(Array.isArray(data) ? data : []);
        } catch {
          setRescuers([]);
        }
      }
    } catch (error) {
      console.error('❌ Error in fetchData:', error);
      // Set defaults instead of throwing
      setRescueRequests([]);
      setRescuers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRescueRequest = async (request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) => {
    // This function will now use the SupabaseService internally if we want, 
    // but for now let's keep it consistent with the context's data fetching mechanism
    // or we can update it to use the new table service.
    
    // Using the original logic for now to ensure compatibility with the existing backend
    // while we transition.
    
    const generatedTrackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const newRequest: RescueRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      trackingId: generatedTrackingId,
      dataType: 'helper_submission',
      submissionSource: 'helper_dashboard',
      createdBy: request.helperName,
      createdByPhone: request.helperPhone,
      lastModified: new Date().toISOString(),
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
        setRescueRequests(prev => [newRequest, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving request:', err);
      return false;
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ) => {
    const previousRequests = [...rescueRequests];
    const updatedRequests = rescueRequests.map((req) =>
      req.id === id
        ? { 
            ...req, 
            status, 
            ...rescuerData,
            lastModified: new Date().toISOString(),
            modifiedBy: rescuerData?.assignedRescuer || 'system'
          }
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
        setRescueRequests(previousRequests);
        throw err;
      }
    }
  };

  return (
    <DataContext.Provider value={{ 
      rescueRequests, 
      rescuers, 
      loading, 
      refreshData: fetchData,
      addRescueRequest,
      updateRequestStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};