import { projectId, publicAnonKey } from './config';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;

export const serverApi = {
  async get(key: string) {
    const res = await fetch(`${SERVER_URL}/kv/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data.value;
  },

  async set(key: string, value: any) {
    const res = await fetch(`${SERVER_URL}/kv/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  },

  async getByPrefix(prefix: string) {
    const res = await fetch(`${SERVER_URL}/kv/prefix/${encodeURIComponent(prefix)}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data.values;
  },

  async del(key: string) {
    const res = await fetch(`${SERVER_URL}/kv/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  }
};