import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { RescueRequest, RescuerAccount } from '../App';

// Initialize Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

export const SupabaseService = {
  // Rescuer Registration
  async registerRescuer(rescuerData: Omit<RescuerAccount, 'id' | 'registeredAt' | 'profileComplete'> & { password?: string }) {
    // In a real implementation, this would insert into the 'rescuer_registration' table
    // and potentially create a Supabase Auth user.
    
    // For now, we'll try to use the existing edge function if available, 
    // or simulate the insertion into the new table structure.
    
    console.log('Registering rescuer to table: rescuer_registration', rescuerData);

    const { data, error } = await supabase
      .from('rescuer_registration')
      .insert([
        {
          full_name: rescuerData.name,
          phone_number: rescuerData.phone,
          email: rescuerData.email,
          // Note: In production, never store plain text passwords. 
          // This should be handled by Supabase Auth or hashed.
          // We are following the user's specific request for the table structure.
          password: rescuerData.password, 
          address: rescuerData.address,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase table insertion failed (table might not exist yet):', error);
      // Fallback to the existing server function for compatibility during migration
      // This ensures the app keeps working while the database schema is being updated
      return this.fallbackRegisterRescuer(rescuerData);
    }

    return { data, error: null };
  },

  async fallbackRegisterRescuer(rescuerData: any) {
    const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;
    try {
        const response = await fetch(`${SERVER_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify(rescuerData)
          });
    
          const data = await response.json();
          if (!response.ok) return { error: data.error || 'Registration failed' };
          return { data };
    } catch (e) {
        return { error: 'Network error' };
    }
  },

  // Helper Request Submission
  async submitHelperRequest(requestData: Omit<RescueRequest, 'id' | 'timestamp' | 'status'>) {
    console.log('Submitting request to table: helper_request_submission', requestData);

    const { data, error } = await supabase
      .from('helper_request_submission')
      .insert([
        {
          helper_name: requestData.helperName,
          helper_phone: requestData.helperPhone,
          helper_alt_phone: requestData.helperAltPhone,
          helper_email: requestData.helperEmail,
          location: requestData.location,
          photo_url: requestData.photoUrl,
          notes: requestData.notes,
          status: 'pending',
          timestamp: new Date().toISOString(),
          // Metadata
          data_type: 'helper_submission',
          submission_source: 'helper_dashboard'
        }
      ])
      .select();

    if (error) {
      console.warn('Supabase table insertion failed (table might not exist yet):', error);
      return this.fallbackSubmitRequest(requestData);
    }

    return { data, error: null };
  },

  async fallbackSubmitRequest(requestData: any) {
    const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d090c6`;
    const generatedTrackingId = `TRK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'pending',
      trackingId: generatedTrackingId,
      dataType: 'helper_submission',
      submissionSource: 'helper_dashboard',
      createdBy: requestData.helperName,
      createdByPhone: requestData.helperPhone,
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
          return { data: newRequest, error: null };
        } else {
          return { error: 'Failed to save request' };
        }
      } catch (err) {
        return { error: 'Error saving request' };
      }
  }
};
