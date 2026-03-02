export interface RescuerRegistration {
  id: string; // UUID
  full_name: string;
  phone_number: string;
  email: string;
  // password is handled by Supabase Auth, not stored in this table directly usually, 
  // but for the sake of the prompt's "fields for...", we acknowledge it exists in the form.
  status: 'active' | 'inactive' | 'pending_verification';
  created_at: string;
  updated_at: string;
  // Additional profile fields
  skills?: string[];
  certification_level?: string;
  current_location?: string; // or geometry/geography type
  availability_status: 'available' | 'busy' | 'offline';
}

export interface HelperRequestSubmission {
  id: string; // UUID
  request_id: string; // Friendly ID (e.g. REQ-1234)
  helper_name: string;
  helper_phone: string;
  helper_email?: string;
  location_address: string;
  location_coordinates?: { lat: number; lng: number };
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  situation_description: string;
  number_of_people?: number;
  medical_needs?: boolean;
  status: 'pending' | 'acknowledged' | 'assigned' | 'resolved' | 'cancelled';
  submitted_at: string;
  updated_at: string;
  // Foreign keys
  assigned_rescuer_id?: string;
}

export interface RescuerMission {
  id: string;
  mission_id: string;
  rescuer_id: string; // FK to rescuer_registration
  request_id: string; // FK to helper_request_submission
  status: 'accepted' | 'en_route' | 'on_site' | 'completed' | 'aborted';
  start_time: string;
  end_time?: string;
  notes?: string;
}
