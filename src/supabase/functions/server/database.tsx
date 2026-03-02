/**
 * Database Service - Interacts with Supabase tables
 * This replaces KV store operations with direct table queries
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

// Helper to create Supabase client
export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );
};

// ============================================================================
// HELPER REQUEST SUBMISSION TABLE
// ============================================================================

export const helperRequests = {
  /**
   * Get all helper requests
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch helper requests: ${error.message}`);
    return data || [];
  },

  /**
   * Get a single helper request by ID
   */
  async getById(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Failed to fetch helper request: ${error.message}`);
    return data;
  },

  /**
   * Get helper request by badge ID
   */
  async getByBadgeId(badgeId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .select('*')
      .eq('badge_id', badgeId)
      .single();
    
    if (error) throw new Error(`Failed to fetch helper request by badge: ${error.message}`);
    return data;
  },

  /**
   * Create a new helper request
   */
  async create(request: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .insert(request)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create helper request: ${error.message}`);
    return data;
  },

  /**
   * Update a helper request
   */
  async update(id: string, updates: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update helper request: ${error.message}`);
    return data;
  },

  /**
   * Get requests by status
   */
  async getByStatus(status: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('helper_request_submission')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch requests by status: ${error.message}`);
    return data || [];
  },
};

// ============================================================================
// RESCUER REGISTRATION TABLE
// ============================================================================

export const rescuerRegistration = {
  /**
   * Get all rescuers
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rescuers: ${error.message}`);
    return data || [];
  },

  /**
   * Get rescuer by ID
   */
  async getById(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Failed to fetch rescuer: ${error.message}`);
    return data;
  },

  /**
   * Get rescuer by badge ID
   */
  async getByBadgeId(badgeId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .select('*')
      .eq('badge_id', badgeId)
      .single();
    
    if (error) throw new Error(`Failed to fetch rescuer by badge: ${error.message}`);
    return data;
  },

  /**
   * Get rescuer by email
   */
  async getByEmail(email: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch rescuer by email: ${error.message}`);
    }
    return data;
  },

  /**
   * Create a new rescuer
   */
  async create(rescuer: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .insert(rescuer)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create rescuer: ${error.message}`);
    return data;
  },

  /**
   * Update rescuer
   */
  async update(id: string, updates: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update rescuer: ${error.message}`);
    return data;
  },

  /**
   * Get available rescuers
   */
  async getAvailable() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_registration')
      .select('*')
      .eq('availability_status', 'Available')
      .eq('verification_status', 'Verified')
      .order('rating', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch available rescuers: ${error.message}`);
    return data || [];
  },
};

// ============================================================================
// CASE ASSIGNING TABLE
// ============================================================================

export const caseAssigning = {
  /**
   * Get all case assignments
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_assigning')
      .select('*')
      .order('assigned_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch case assignments: ${error.message}`);
    return data || [];
  },

  /**
   * Get assignments for a specific rescuer
   */
  async getByRescuerId(rescuerId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_assigning')
      .select('*')
      .eq('rescuer_id', rescuerId)
      .order('assigned_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rescuer assignments: ${error.message}`);
    return data || [];
  },

  /**
   * Get assignments for a specific request
   */
  async getByRequestId(requestId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_assigning')
      .select('*')
      .eq('request_id', requestId)
      .order('assigned_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch request assignments: ${error.message}`);
    return data || [];
  },

  /**
   * Create a new assignment
   */
  async create(assignment: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_assigning')
      .insert(assignment)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create assignment: ${error.message}`);
    return data;
  },

  /**
   * Update assignment status
   */
  async update(id: string, updates: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_assigning')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update assignment: ${error.message}`);
    return data;
  },
};

// ============================================================================
// CASE REJECTION TABLE
// ============================================================================

export const caseRejection = {
  /**
   * Get all rejections
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_rejection')
      .select('*')
      .order('rejected_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rejections: ${error.message}`);
    return data || [];
  },

  /**
   * Get rejections by rescuer
   */
  async getByRescuerId(rescuerId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_rejection')
      .select('*')
      .eq('rescuer_id', rescuerId)
      .order('rejected_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rescuer rejections: ${error.message}`);
    return data || [];
  },

  /**
   * Create a rejection record
   */
  async create(rejection: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('case_rejection')
      .insert(rejection)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create rejection: ${error.message}`);
    return data;
  },
};

// ============================================================================
// RESCUER DIRECTORY TABLE (Admin)
// ============================================================================

export const rescuerDirectory = {
  /**
   * Get all directory entries
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_directory')
      .select(`
        *,
        rescuer_registration (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rescuer directory: ${error.message}`);
    return data || [];
  },

  /**
   * Get directory entry by rescuer ID
   */
  async getByRescuerId(rescuerId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_directory')
      .select(`
        *,
        rescuer_registration (*)
      `)
      .eq('rescuer_id', rescuerId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch directory entry: ${error.message}`);
    }
    return data;
  },

  /**
   * Create directory entry
   */
  async create(entry: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_directory')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create directory entry: ${error.message}`);
    return data;
  },

  /**
   * Update directory entry
   */
  async update(rescuerId: string, updates: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_directory')
      .update(updates)
      .eq('rescuer_id', rescuerId)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update directory entry: ${error.message}`);
    return data;
  },
};

// ============================================================================
// RESCUER ASSIGNMENT TABLE (Admin)
// ============================================================================

export const rescuerAssignment = {
  /**
   * Get all assignments
   */
  async getAll() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_assignment')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to fetch rescuer assignments: ${error.message}`);
    return data || [];
  },

  /**
   * Create assignment
   */
  async create(assignment: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_assignment')
      .insert(assignment)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create rescuer assignment: ${error.message}`);
    return data;
  },

  /**
   * Update assignment workflow stage
   */
  async updateStage(id: string, stage: string, history: any) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rescuer_assignment')
      .update({
        workflow_stage: stage,
        stage_history: history,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update assignment stage: ${error.message}`);
    return data;
  },
};
