import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RescueRequest, RescuerAccount } from '../App';
import { serverApi } from '../utils/server-api';

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [rescuers, setRescuers] = useState<RescuerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all entries from the KV store using prefix queries on the server
      const [requestsData, rescuersData] = await Promise.all([
        serverApi.getByPrefix('request:'),
        serverApi.getByPrefix('rescuer:')
      ]);

      if (requestsData) {
        const sortedRequests = (requestsData as RescueRequest[])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRescueRequests(sortedRequests);
      }

      if (rescuersData) {
        const sortedRescuers = (rescuersData as RescuerAccount[])
          .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        setRescuers(sortedRescuers);
      }
      
      console.log('✅ Data synchronized from Server API');
    } catch (error) {
      console.error('❌ DataProvider fetch error from server:', error);
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
    const id = crypto.randomUUID();
    const trackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const key = `request:${id}`;
    
    const requestRecord: RescueRequest = {
      ...request,
      id,
      trackingId,
      status: 'pending',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    try {
      await serverApi.set(key, requestRecord);
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error saving request via server:', err);
      return false;
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ) => {
    const key = `request:${id}`;
    
    try {
      const currentData = await serverApi.get(key);
      if (!currentData) throw new Error('Request not found on server');

      const updatedRequest = {
        ...currentData,
        status,
        ...(rescuerData || {}),
        lastModified: new Date().toISOString()
      };

      await serverApi.set(key, updatedRequest);
      await fetchData();
    } catch (err) {
      console.error('Error updating status via server:', err);
      throw err;
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
