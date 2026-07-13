import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RescueRequest, RescuerAccount } from '../App';

// ── localStorage keys (five-table namespaces) ─────────────────────────────────
export const LS = {
  CASES:       'hs:cases',        // case_details table
  SUBMISSIONS: 'hs:submissions',  // helper_submitted table
  RESCUERS:    'hs:rescuers',     // rescuer_register table
  DIRECTORY:   'hs:directory',    // rescuer_directory table
  ASSIGNMENTS: 'hs:assignments',  // rescuer_assignment table
  AUTH:        'hs:auth',         // auth credentials (email → hashed pw + userId)
};

// ── Storage helpers ───────────────────────────────────────────────────────────
export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Context types ─────────────────────────────────────────────────────────────
interface DataContextType {
  rescueRequests: RescueRequest[];
  rescuers: RescuerAccount[];
  loading: boolean;
  refreshData: () => void;
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
  const [rescuers, setRescuers]             = useState<RescuerAccount[]>([]);
  const [loading, setLoading]               = useState(false);

  const refreshData = () => {
    setLoading(true);
    try {
      const cases = lsGet<RescueRequest[]>(LS.CASES, []);
      const resc  = lsGet<RescuerAccount[]>(LS.RESCUERS, []);
      const sorted = [...cases].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setRescueRequests(sorted);
      setRescuers(resc);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const addRescueRequest = async (
    request: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>
  ): Promise<boolean> => {
    try {
      const id = crypto.randomUUID();
      const trackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
        .toString().padStart(4, '0')}`;
      const now = new Date().toISOString();

      // helper_submitted record
      const submission = { id, ...request, submittedAt: now };
      const submissions = lsGet<any[]>(LS.SUBMISSIONS, []);
      lsSet(LS.SUBMISSIONS, [submission, ...submissions]);

      // case_details record
      const newCase: RescueRequest = {
        ...(request as any),
        id,
        trackingId,
        status:           'pending',
        timestamp:        now,
        lastModified:     now,
        assignedRescuer:  '',
        rescuerId:        '',
        rescuerNotes:     '',
        rejectedBy:       [],
        rejectionReasons: [],
      };
      const existing = lsGet<RescueRequest[]>(LS.CASES, []);
      lsSet(LS.CASES, [newCase, ...existing]);
      refreshData();
      return true;
    } catch (err) {
      console.error('Error adding rescue request:', err);
      return false;
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: RescueRequest['status'],
    rescuerData?: any
  ): Promise<void> => {
    const now = new Date().toISOString();
    const cases = lsGet<RescueRequest[]>(LS.CASES, []);
    const updated = cases.map(c =>
      c.id === id ? { ...c, ...rescuerData, status, lastModified: now } : c
    );
    lsSet(LS.CASES, updated);

    // rescuer_assignment record
    if (rescuerData?.rescuerId) {
      const existing = lsGet<any[]>(LS.ASSIGNMENTS, []);
      const idx = existing.findIndex(a => a.caseId === id);
      const assignment = {
        id,
        caseId:       id,
        rescuerId:    rescuerData.rescuerId,
        rescuerName:  rescuerData.assignedRescuer || rescuerData.rescuerId,
        status,
        assignedAt:   now,
        lastModified: now,
      };
      if (idx >= 0) existing[idx] = assignment;
      else existing.unshift(assignment);
      lsSet(LS.ASSIGNMENTS, existing);
    }

    refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        rescueRequests,
        rescuers,
        loading,
        refreshData,
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
