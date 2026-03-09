import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RescueRequest, RescuerAccount } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// ── Server API config ─────────────────────────────────────────────────────────
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ── Context types ─────────────────────────────────────────────────────────────
interface DataContextType {
  rescueRequests: RescueRequest[];
  rescuers: RescuerAccount[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addRescueRequest: (
    request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>
  ) => Promise<boolean>;
  updateRequestStatus: (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [rescueRequests, setRescueRequests] = useState<RescueRequest[]>([]);
  const [rescuers, setRescuers] = useState<RescuerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * fetchData – reads from:
   *   • case_details table  → GET /cases
   *   • rescuer_register table → GET /rescuers
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, rescuersRes] = await Promise.all([
        fetch(`${BASE_URL}/cases`, { headers: HEADERS }),
        fetch(`${BASE_URL}/rescuers`, { headers: HEADERS }),
      ]);

      if (!casesRes.ok) {
        const err = await casesRes.json().catch(() => ({}));
        throw new Error(`cases endpoint error: ${err.error || casesRes.status}`);
      }
      if (!rescuersRes.ok) {
        const err = await rescuersRes.json().catch(() => ({}));
        throw new Error(`rescuers endpoint error: ${err.error || rescuersRes.status}`);
      }

      const casesData    = await casesRes.json();
      const rescuersData = await rescuersRes.json();

      setRescueRequests((casesData.data    as RescueRequest[])  || []);
      setRescuers(      (rescuersData.data as RescuerAccount[]) || []);

      console.log(
        `✅ DataContext synced from Supabase — cases: ${(casesData.data || []).length}, rescuers: ${(rescuersData.data || []).length}`
      );
    } catch (error) {
      console.error('❌ DataContext fetchData error:', error);
      setRescueRequests([]);
      setRescuers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * addRescueRequest – writes to:
   *   • helper_submitted table
   *   • case_details table
   *   (both written atomically in POST /cases on the server)
   */
  const addRescueRequest = async (
    request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/cases`, {
        method:  'POST',
        headers: HEADERS,
        body:    JSON.stringify(request),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`POST /cases failed: ${err.error || res.status}`);
      }

      const result = await res.json();
      console.log('✅ helper_submitted + case_details records created:', result.data?.id);
      await fetchData();
      return true;
    } catch (err) {
      console.error('❌ Error adding rescue request:', err);
      return false;
    }
  };

  /**
   * updateRequestStatus – writes to:
   *   • case_details table       (always)
   *   • rescuer_assignment table (when a rescuerId is present in rescuerData)
   */
  const updateRequestStatus = async (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ): Promise<void> => {
    try {
      const payload = { status, ...(rescuerData || {}) };

      const res = await fetch(`${BASE_URL}/cases/${id}`, {
        method:  'PUT',
        headers: HEADERS,
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`PUT /cases/${id} failed: ${err.error || res.status}`);
      }

      console.log(`✅ case_details[${id}] status → ${status}`);
      await fetchData();
    } catch (err) {
      console.error('❌ Error updating request status:', err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        rescueRequests,
        rescuers,
        loading,
        refreshData: fetchData,
        addRescueRequest,
        updateRequestStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
