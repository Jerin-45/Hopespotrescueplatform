-- ============================================================================
-- HOPE SPOT - Complete Database Schema for Supabase Migration
-- ============================================================================
-- Instructions:
-- 1. Create a new Supabase project at https://supabase.com/dashboard
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Copy and paste this entire schema
-- 4. Click "Run" to execute
-- 5. Update your app's environment variables with new connection details
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER DASHBOARD TABLE
-- ============================================================================

-- Table: helper_request_submission
-- Stores all help requests submitted by civilians
CREATE TABLE helper_request_submission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id VARCHAR(20) UNIQUE NOT NULL, -- Friendly ID like "REQ-12345"
  helper_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  emergency_type VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Assigned, Accepted, Completed, Rejected
  assigned_rescuer_id UUID, -- References rescuer_registration.id
  assigned_rescuer_badge_id VARCHAR(20), -- For display purposes
  priority VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX idx_helper_status ON helper_request_submission(status);
CREATE INDEX idx_helper_created ON helper_request_submission(created_at DESC);
CREATE INDEX idx_helper_badge ON helper_request_submission(badge_id);
CREATE INDEX idx_helper_assigned_rescuer ON helper_request_submission(assigned_rescuer_id);

-- ============================================================================
-- RESCUER DASHBOARD TABLES
-- ============================================================================

-- Table: rescuer_registration
-- Stores all rescuer accounts and profiles
CREATE TABLE rescuer_registration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id VARCHAR(20) UNIQUE NOT NULL, -- Friendly ID like "RES-ABC123"
  auth_user_id UUID, -- Supabase Auth user ID (if using auth)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  skills TEXT[], -- Array of skills
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  availability_status VARCHAR(50) DEFAULT 'Available', -- Available, Busy, Offline
  verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Verified, Rejected
  profile_photo_url TEXT,
  total_missions_completed INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rescuer queries
CREATE INDEX idx_rescuer_email ON rescuer_registration(email);
CREATE INDEX idx_rescuer_badge ON rescuer_registration(badge_id);
CREATE INDEX idx_rescuer_status ON rescuer_registration(availability_status);
CREATE INDEX idx_rescuer_verification ON rescuer_registration(verification_status);

-- Table: case_assigning
-- Tracks all case assignments to rescuers
CREATE TABLE case_assigning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES helper_request_submission(id) ON DELETE CASCADE,
  request_badge_id VARCHAR(20) NOT NULL,
  rescuer_id UUID NOT NULL REFERENCES rescuer_registration(id) ON DELETE CASCADE,
  rescuer_badge_id VARCHAR(20) NOT NULL,
  assigned_by VARCHAR(50) DEFAULT 'System', -- Admin badge ID or "System"
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'Assigned', -- Assigned, Accepted, Completed, Rejected
  notes TEXT,
  estimated_arrival_time TIMESTAMP WITH TIME ZONE,
  actual_arrival_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for assignment tracking
CREATE INDEX idx_case_request ON case_assigning(request_id);
CREATE INDEX idx_case_rescuer ON case_assigning(rescuer_id);
CREATE INDEX idx_case_status ON case_assigning(status);
CREATE INDEX idx_case_assigned_at ON case_assigning(assigned_at DESC);

-- Table: case_rejection
-- Tracks when rescuers reject assignments
CREATE TABLE case_rejection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES helper_request_submission(id) ON DELETE CASCADE,
  request_badge_id VARCHAR(20) NOT NULL,
  rescuer_id UUID NOT NULL REFERENCES rescuer_registration(id) ON DELETE CASCADE,
  rescuer_badge_id VARCHAR(20) NOT NULL,
  assignment_id UUID REFERENCES case_assigning(id) ON DELETE SET NULL,
  rejection_reason TEXT NOT NULL,
  rejected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Indexes for rejection tracking
CREATE INDEX idx_rejection_request ON case_rejection(request_id);
CREATE INDEX idx_rejection_rescuer ON case_rejection(rescuer_id);
CREATE INDEX idx_rejection_date ON case_rejection(rejected_at DESC);

-- ============================================================================
-- ADMIN DASHBOARD TABLES
-- ============================================================================

-- Table: rescuer_directory
-- Admin view of all rescuers with verification and management info
CREATE TABLE rescuer_directory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rescuer_id UUID UNIQUE NOT NULL REFERENCES rescuer_registration(id) ON DELETE CASCADE,
  rescuer_badge_id VARCHAR(20) UNIQUE NOT NULL,
  verified_by_admin_badge_id VARCHAR(20),
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  background_check_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Passed, Failed
  training_status VARCHAR(50) DEFAULT 'Not Started', -- Not Started, In Progress, Completed
  certifications TEXT[], -- Array of certification names
  is_active BOOLEAN DEFAULT true,
  suspension_reason TEXT,
  suspended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for directory management
CREATE INDEX idx_directory_rescuer ON rescuer_directory(rescuer_id);
CREATE INDEX idx_directory_active ON rescuer_directory(is_active);
CREATE INDEX idx_directory_verification ON rescuer_directory(background_check_status);

-- Table: rescuer_assignment (admin tracking of all assignments)
-- Central admin view of all assignments and their workflow
CREATE TABLE rescuer_assignment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES helper_request_submission(id) ON DELETE CASCADE,
  request_badge_id VARCHAR(20) NOT NULL,
  rescuer_id UUID NOT NULL REFERENCES rescuer_registration(id) ON DELETE CASCADE,
  rescuer_badge_id VARCHAR(20) NOT NULL,
  assignment_id UUID REFERENCES case_assigning(id) ON DELETE SET NULL,
  workflow_stage VARCHAR(50) DEFAULT 'Pending', -- Pending → Assigned → Accepted → Completed
  assigned_by_admin_badge_id VARCHAR(20),
  admin_notes TEXT,
  priority_override VARCHAR(20), -- Can override request priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_history JSONB DEFAULT '[]'::jsonb -- Track workflow transitions
);

-- Indexes for admin assignment tracking
CREATE INDEX idx_assignment_request ON rescuer_assignment(request_id);
CREATE INDEX idx_assignment_rescuer ON rescuer_assignment(rescuer_id);
CREATE INDEX idx_assignment_stage ON rescuer_assignment(workflow_stage);
CREATE INDEX idx_assignment_created ON rescuer_assignment(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_helper_request_updated_at BEFORE UPDATE ON helper_request_submission
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rescuer_registration_updated_at BEFORE UPDATE ON rescuer_registration
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_assigning_updated_at BEFORE UPDATE ON case_assigning
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rescuer_directory_updated_at BEFORE UPDATE ON rescuer_directory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rescuer_assignment_updated_at BEFORE UPDATE ON rescuer_assignment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Generate friendly badge IDs
CREATE OR REPLACE FUNCTION generate_helper_badge_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.badge_id IS NULL THEN
    NEW.badge_id := 'REQ-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_rescuer_badge_id()
RETURNS TRIGGER AS $$
DECLARE
  random_suffix TEXT;
BEGIN
  IF NEW.badge_id IS NULL THEN
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    NEW.badge_id := 'RES-' || random_suffix;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply badge ID generation triggers
CREATE TRIGGER generate_helper_badge BEFORE INSERT ON helper_request_submission
  FOR EACH ROW EXECUTE FUNCTION generate_helper_badge_id();

CREATE TRIGGER generate_rescuer_badge BEFORE INSERT ON rescuer_registration
  FOR EACH ROW EXECUTE FUNCTION generate_rescuer_badge_id();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE helper_request_submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescuer_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_assigning ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_rejection ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescuer_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescuer_assignment ENABLE ROW LEVEL SECURITY;

-- Public access policies (adjust based on your auth requirements)
-- Note: These are permissive for development. Tighten for production!

CREATE POLICY "Allow public read on helper requests" ON helper_request_submission
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on helper requests" ON helper_request_submission
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role all on helper requests" ON helper_request_submission
  FOR ALL USING (true);

CREATE POLICY "Allow public read on rescuer registration" ON rescuer_registration
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on rescuer registration" ON rescuer_registration
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role all on rescuer registration" ON rescuer_registration
  FOR ALL USING (true);

CREATE POLICY "Allow all on case assigning" ON case_assigning
  FOR ALL USING (true);

CREATE POLICY "Allow all on case rejection" ON case_rejection
  FOR ALL USING (true);

CREATE POLICY "Allow all on rescuer directory" ON rescuer_directory
  FOR ALL USING (true);

CREATE POLICY "Allow all on rescuer assignment" ON rescuer_assignment
  FOR ALL USING (true);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample helper request
INSERT INTO helper_request_submission (badge_id, helper_name, phone, location, emergency_type, description, status)
VALUES ('REQ-00001', 'John Doe', '+1234567890', '123 Main St, City', 'Medical Emergency', 'Need immediate medical assistance', 'Pending');

-- Insert sample rescuer
INSERT INTO rescuer_registration (badge_id, name, email, phone, skills, location, availability_status, verification_status)
VALUES ('RES-ABC123', 'Jane Smith', 'jane@rescue.com', '+0987654321', ARRAY['Medical', 'First Aid'], '456 Oak Ave, City', 'Available', 'Verified');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Schema created successfully! 
-- Next steps:
-- 1. Note your Supabase project URL and keys
-- 2. Update your app environment variables
-- 3. Deploy the updated backend code
-- ============================================================================
