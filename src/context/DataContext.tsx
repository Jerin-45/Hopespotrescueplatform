import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RescueRequest, RescuerAccount } from '../App';

// ── Inline localStorage helpers (replaces /utils/local-storage.ts) ─────────
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
  del(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('localStorage delete error:', err);
      throw err;
    }
  },
};
// ───────────────────────────────────────────────────────────────────────────

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
      const requestsData = ls.getByPrefix('request:');
      const rescuersData = ls.getByPrefix('rescuer:');

      const sortedRequests = (requestsData as RescueRequest[])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRescueRequests(sortedRequests);

      const sortedRescuers = (rescuersData as RescuerAccount[])
        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
      setRescuers(sortedRescuers);

      console.log('✅ Data synchronized from localStorage');
    } catch (error) {
      console.error('❌ DataProvider fetch error:', error);
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
      lastModified: new Date().toISOString(),
    };

    try {
      ls.set(key, requestRecord);
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error saving request to localStorage:', err);
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
      const current = ls.get(key);
      if (!current) throw new Error('Request not found');

      ls.set(key, {
        ...current,
        status,
        ...(rescuerData || {}),
        lastModified: new Date().toISOString(),
      });
      await fetchData();
    } catch (err) {
      console.error('Error updating status in localStorage:', err);
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
      updateRequestStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
