This document consolidates the Supabase database scripts (including schema and Row Level Security policies) and the required API endpoints for the Aptly mobile application.

### Supabase Database Scripts

The database schema is designed to support multi-tier admin roles, democratic governance features, and comprehensive audit trails, while ensuring data isolation and adherence to best practices.

#### 1\. Enumerated Types (Enums)

```sql
-- User Roles for role-based access control (Updated for Phase 7)
CREATE TYPE user_role AS ENUM (
  'resident',
  'committee_member',
  'secretary',
  'treasurer',
  'maintenance_staff',
  'security_guard',
  'super_admin',
  'community_manager',
  'financial_manager',
  'security_admin',
  'maintenance_admin'
);

-- Categories for maintenance requests
CREATE TYPE maintenance_category AS ENUM (
  'electrical',
  'plumbing',
  'civil',
  'lift',
  'generator',
  'cleaning',
  'security',
  'appliances',
  'water_systems',
  'parking',
  'other'
);

-- Priority levels for requests
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'emergency');

-- Status of maintenance requests
CREATE TYPE request_status AS ENUM ('submitted', 'assigned', 'in_progress', 'completed', 'rejected', 'on_hold');

-- Status of bills
CREATE TYPE bill_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Status of payments
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Community Post Categories
CREATE TYPE post_category AS ENUM (
  'announcement',
  'buy_sell',
  'events_activities',
  'lost_found',
  'help_requests',
  'general_feedback',
  'community_suggestions'
);

-- Visitor status types (for visitor management)
CREATE TYPE visitor_status AS ENUM ('pending', 'approved', 'pre_approved', 'rejected', 'checked_in', 'checked_out', 'expired');

-- Visitor categories
CREATE TYPE visitor_category AS ENUM ('personal', 'delivery', 'service', 'official', 'emergency', 'contractor');

-- Admin session status
CREATE TYPE session_status AS ENUM ('active', 'expired', 'terminated');

-- Permission scopes for RBAC
CREATE TYPE permission_scope AS ENUM ('global', 'society', 'own', 'assigned');

-- Audit event categories
CREATE TYPE audit_category AS ENUM (
  'admin_actions',
  'billing_finance', 
  'maintenance_management',
  'security_management',
  'resident_management',
  'communication',
  'voting_governance',
  'emergency_response'
);
```

#### 2\. Tables with Schema and RLS Policies

All tables will have Row Level Security (RLS) enabled to ensure data privacy and access control based on user roles and society affiliation.

```sql
-- Enable RLS for all tables (Updated for Phase 7)
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
-- NEW TABLES FOR PHASE 7
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE society_settings ENABLE ROW LEVEL SECURITY;

-- Admin roles and multi-society assignments (NEW for Phase 7)
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  valid_until TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, society_id, role)
);

-- RLS for admin_roles
CREATE POLICY "Allow super_admin to manage all admin roles" ON admin_roles FOR ALL TO authenticated USING (get_user_role() = 'super_admin');
CREATE POLICY "Allow community_manager to manage sub-admin roles in their society" ON admin_roles FOR ALL TO authenticated USING (
  get_user_role() = 'community_manager' 
  AND society_id = get_user_society_id() 
  AND role IN ('financial_manager', 'security_admin', 'maintenance_admin')
);
CREATE POLICY "Allow users to read their own admin roles" ON admin_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admin sessions (NEW for Phase 7)
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  status session_status DEFAULT 'active',
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- RLS for admin_sessions
CREATE POLICY "Allow users to read their own sessions" ON admin_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow super_admin to read all sessions" ON admin_sessions FOR SELECT TO authenticated USING (get_user_role() = 'super_admin');

-- Visitors table (NEW - missing from original schema)
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  host_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  visitor_name VARCHAR(100) NOT NULL,
  visitor_phone VARCHAR(13),
  visitor_photo_url TEXT,
  category visitor_category NOT NULL,
  purpose TEXT NOT NULL,
  expected_date DATE NOT NULL,
  expected_time TIME,
  duration_hours INTEGER DEFAULT 2,
  status visitor_status DEFAULT 'pending',
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  qr_code_data TEXT,
  security_notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for visitors
CREATE POLICY "Allow residents to create visitors for their society" ON visitors FOR INSERT TO authenticated WITH CHECK (
  society_id = get_user_society_id() AND host_user_id = auth.uid()
);
CREATE POLICY "Allow society members to read visitors in their society" ON visitors FOR SELECT TO authenticated USING (
  society_id = get_user_society_id()
);
CREATE POLICY "Allow hosts to update their own visitor requests" ON visitors FOR UPDATE TO authenticated USING (
  host_user_id = auth.uid() AND status IN ('pending', 'approved')
);
CREATE POLICY "Allow security_admin and community_manager to manage all visitors" ON visitors FOR ALL TO authenticated USING (
  get_user_role() IN ('security_admin', 'community_manager', 'super_admin') 
  AND society_id = get_user_society_id()
);

-- Enhanced audit logs (Updated for Phase 7)
CREATE TABLE enhanced_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES admin_sessions(id) ON DELETE SET NULL,
  category audit_category NOT NULL,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  actor_role user_role,
  target_user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_agent TEXT,
  retention_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for enhanced_audit_logs
CREATE POLICY "Allow super_admin to read all audit logs" ON enhanced_audit_logs FOR SELECT TO authenticated USING (get_user_role() = 'super_admin');
CREATE POLICY "Allow society_admins to read audit logs for their society" ON enhanced_audit_logs FOR SELECT TO authenticated USING (
  get_user_role() IN ('community_manager', 'financial_manager', 'security_admin', 'maintenance_admin') 
  AND society_id = get_user_society_id()
);

-- Enhanced permissions table (Updated for Phase 7)
CREATE TABLE enhanced_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  scope permission_scope NOT NULL,
  conditions JSONB DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (role, resource, action, scope)
);

-- RLS for enhanced_permissions
CREATE POLICY "Allow super_admin to manage permissions" ON enhanced_permissions FOR ALL TO authenticated USING (get_user_role() = 'super_admin');
CREATE POLICY "Allow all authenticated users to read active permissions" ON enhanced_permissions FOR SELECT TO authenticated USING (is_active = true);

-- Society settings (NEW for multi-society management)
CREATE TABLE society_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL UNIQUE,
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  gst_enabled BOOLEAN DEFAULT true,
  gst_rate DECIMAL(5,2) DEFAULT 18.00,
  late_fee_enabled BOOLEAN DEFAULT true,
  late_fee_amount DECIMAL(10,2) DEFAULT 100.00,
  visitor_approval_required BOOLEAN DEFAULT true,
  visitor_max_duration_hours INTEGER DEFAULT 12,
  emergency_contacts JSONB DEFAULT '[]',
  features JSONB DEFAULT '{}',
  policies JSONB DEFAULT '[]',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for society_settings
CREATE POLICY "Allow society members to read their society settings" ON society_settings FOR SELECT TO authenticated USING (
  society_id = get_user_society_id()
);
CREATE POLICY "Allow community_manager and super_admin to manage society settings" ON society_settings FOR ALL TO authenticated USING (
  get_user_role() IN ('community_manager', 'super_admin') 
  AND society_id = get_user_society_id()
);

-- Societies table
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  pin_code VARCHAR(6) NOT NULL,
  total_flats INTEGER NOT NULL,
  total_buildings INTEGER DEFAULT 1,
  gst_number VARCHAR(15),
  registration_number VARCHAR(50),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(13),
  maintenance_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for societies
CREATE POLICY "Allow all authenticated users to read societies" ON societies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow super_admin to insert societies" ON societies FOR INSERT TO authenticated WITH CHECK ((get_user_role() = 'super_admin'));
CREATE POLICY "Allow super_admin to update societies" ON societies FOR UPDATE TO authenticated USING ((get_user_role() = 'super_admin'));
CREATE POLICY "Allow super_admin to delete societies" ON societies FOR DELETE TO authenticated USING ((get_user_role() = 'super_admin'));

-- Extended user profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  phone VARCHAR(13) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  flat_number VARCHAR(10),
  building_name VARCHAR(50),
  floor_number INTEGER,
  is_owner BOOLEAN DEFAULT false,
  is_primary_contact BOOLEAN DEFAULT false,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(13),
  occupation VARCHAR(100),
  date_of_birth DATE,
  is_verified BOOLEAN DEFAULT false,
  verification_requested_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for user_profiles
CREATE POLICY "Allow authenticated users to read their own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow authenticated users to update their own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Allow society members to view profiles within their society" ON user_profiles FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow community_manager to manage users in their society" ON user_profiles FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  age INTEGER,
  phone VARCHAR(13),
  occupation VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for family_members
CREATE POLICY "Allow user to manage their family members" ON family_members FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow society_members to view family members in their society" ON family_members FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM user_profiles WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('car', 'bike', 'bicycle', 'other')),
  vehicle_number VARCHAR(20) NOT NULL,
  brand VARCHAR(50),
  model VARCHAR(50),
  color VARCHAR(30),
  parking_slot VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for vehicles
CREATE POLICY "Allow user to manage their vehicles" ON vehicles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow society_members to view vehicles in their society" ON vehicles FOR SELECT TO authenticated USING (user_id IN (SELECT id FROM user_profiles WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));

-- Maintenance requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  category maintenance_category NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  priority request_priority DEFAULT 'medium',
  status request_status DEFAULT 'submitted',
  assigned_to UUID REFERENCES user_profiles(id),
  photo_urls TEXT[],
  voice_note_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for maintenance_requests
CREATE POLICY "Allow residents to create maintenance requests for their society" ON maintenance_requests FOR INSERT TO authenticated WITH CHECK (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow society members to view maintenance requests in their society" ON maintenance_requests FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow assigned staff or relevant admins to update maintenance requests" ON maintenance_requests FOR UPDATE TO authenticated USING (
    (assigned_to = auth.uid() AND (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'maintenance_staff')
    OR
    (get_user_role() IN ('community_manager', 'super_admin', 'maintenance_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()))
);
CREATE POLICY "Allow relevant admins to delete maintenance requests" ON maintenance_requests FOR DELETE TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin', 'maintenance_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Maintenance updates (for comments/status changes)
CREATE TABLE maintenance_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE NOT NULL,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  comment TEXT,
  new_status request_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for maintenance_updates
CREATE POLICY "Allow society members to view maintenance updates" ON maintenance_updates FOR SELECT TO authenticated USING (request_id IN (SELECT id FROM maintenance_requests WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));
CREATE POLICY "Allow assigned staff or relevant admins to add maintenance updates" ON maintenance_updates FOR INSERT TO authenticated WITH CHECK (
    (new_status IS NOT NULL AND (SELECT assigned_to FROM maintenance_requests WHERE id = request_id) = auth.uid() AND (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'maintenance_staff')
    OR
    ((SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('community_manager', 'super_admin', 'maintenance_admin') AND request_id IN (SELECT id FROM maintenance_requests WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())))
    OR
    ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'resident' AND (SELECT raised_by FROM maintenance_requests WHERE id = request_id) = auth.uid())
);

-- Vendor categories (e.g., Plumbing, Electrical)
CREATE TABLE vendor_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for vendor_categories
CREATE POLICY "Allow all authenticated users to read vendor categories" ON vendor_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow super_admin to manage vendor categories" ON vendor_categories FOR ALL TO authenticated USING (get_user_role() = 'super_admin');

-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(13),
  email VARCHAR(100),
  address TEXT,
  is_verified BOOLEAN DEFAULT false,
  avg_rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  rate_card_description TEXT,
  logo_url TEXT,
  is_emergency_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for vendors
CREATE POLICY "Allow all authenticated users to read global vendors" ON vendors FOR SELECT TO authenticated USING (society_id IS NULL);
CREATE POLICY "Allow society members to read vendors in their society" ON vendors FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow relevant admins to manage vendors" ON vendors FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin', 'maintenance_admin') AND (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()) OR society_id IS NULL));

-- Linking vendors to categories (many-to-many)
CREATE TABLE vendor_services (
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES vendor_categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (vendor_id, category_id)
);

-- RLS for vendor_services
CREATE POLICY "Allow all authenticated users to read vendor services" ON vendor_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow relevant admins to manage vendor services" ON vendor_services FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin', 'maintenance_admin'));

-- Vendor reviews
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for vendor_reviews
CREATE POLICY "Allow all authenticated users to read vendor reviews" ON vendor_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to create vendor reviews" ON vendor_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow user to update their own vendor review" ON vendor_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow user to delete their own vendor review" ON vendor_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2),
  status bill_status DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for bills
CREATE POLICY "Allow relevant admins to manage all bills in their society" ON bills FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin', 'financial_manager') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow residents to read their own bills" ON bills FOR SELECT TO authenticated USING (user_id = auth.uid() AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Bill items
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  gst_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for bill_items
CREATE POLICY "Allow relevant admins to manage bill items" ON bill_items FOR ALL TO authenticated USING (bill_id IN (SELECT id FROM bills WHERE get_user_role() IN ('community_manager', 'super_admin', 'financial_manager') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));
CREATE POLICY "Allow residents to read bill items for their bills" ON bill_items FOR SELECT TO authenticated USING (bill_id IN (SELECT id FROM bills WHERE user_id = auth.uid()));

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  payment_gateway VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status payment_status DEFAULT 'pending',
  method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payments
CREATE POLICY "Allow relevant admins to manage payments in their society" ON payments FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin', 'financial_manager') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow residents to read their own payments" ON payments FOR SELECT TO authenticated USING (user_id = auth.uid() AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Amenities
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  booking_rate DECIMAL(10,2),
  capacity INTEGER,
  is_available BOOLEAN DEFAULT true,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for amenities
CREATE POLICY "Allow society members to read amenities in their society" ON amenities FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow relevant admins to manage amenities" ON amenities FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Amenity bookings
CREATE TABLE amenity_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for amenity_bookings
CREATE POLICY "Allow users to create their own amenity bookings" ON amenity_bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow users to read their own amenity bookings" ON amenity_bookings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow users to cancel their own pending amenity bookings" ON amenity_bookings FOR UPDATE TO authenticated USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Allow relevant admins to manage all amenity bookings" ON amenity_bookings FOR ALL TO authenticated USING (amenity_id IN (SELECT id FROM amenities WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())) AND get_user_role() IN ('community_manager', 'super_admin'));

-- Notices/Announcements
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  posted_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for notices
CREATE POLICY "Allow all authenticated users to read notices in their society" ON notices FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow relevant admins to manage notices" ON notices FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Community Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  category post_category NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for posts
CREATE POLICY "Allow all authenticated users to read posts in their society" ON posts FOR SELECT TO authenticated USING (society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow authenticated users to create posts in their society" ON posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow users to update their own posts" ON posts FOR UPDATE TO authenticated USING (user_id = auth.uid() AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow users to delete their own posts" ON posts FOR DELETE TO authenticated USING (user_id = auth.uid() AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));
CREATE POLICY "Allow community managers and super admins to manage all posts" ON posts FOR ALL TO authenticated USING (get_user_role() IN ('community_manager', 'super_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Comments on posts
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for comments
CREATE POLICY "Allow all authenticated users to read comments" ON comments FOR SELECT TO authenticated USING (post_id IN (SELECT id FROM posts WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));
CREATE POLICY "Allow authenticated users to create comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND post_id IN (SELECT id FROM posts WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())));
CREATE POLICY "Allow users to update their own comments" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow users to delete their own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow community managers and super admins to manage all comments" ON comments FOR ALL TO authenticated USING (post_id IN (SELECT id FROM posts WHERE society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid())) AND get_user_role() IN ('community_manager', 'super_admin'));

-- Likes on posts and comments
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_post_or_comment_id CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- RLS for likes
CREATE POLICY "Allow all authenticated users to read likes" ON likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to create/delete likes" ON likes FOR ALL TO authenticated USING (user_id = auth.uid());

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  society_id UUID REFERENCES societies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for audit_logs
CREATE POLICY "Allow super_admin to read all audit logs" ON audit_logs FOR SELECT TO authenticated USING (get_user_role() = 'super_admin');
CREATE POLICY "Allow society_admins to read audit logs for their society" ON audit_logs FOR SELECT TO authenticated USING (get_user_role() IN ('community_manager', 'financial_manager', 'security_admin', 'maintenance_admin') AND society_id = (SELECT society_id FROM user_profiles WHERE id = auth.uid()));

-- Permissions (for granular control, can be used by Super Admin for CMs, or CMs for Sub-Admins)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('global', 'single_society', 'multi_society')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (role, resource, action, scope)
);

-- RLS for permissions
CREATE POLICY "Allow super_admin to manage permissions" ON permissions FOR ALL TO authenticated USING (get_user_role() = 'super_admin');
CREATE POLICY "Allow authenticated users to read permissions" ON permissions FOR SELECT TO authenticated USING (true);
```

#### 3\. Helper Functions for RLS

```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_society_id()
RETURNS UUID AS $$
  SELECT society_id FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;
```

### Mobile App API Endpoints

This section lists the API endpoints required for seamless integration with the mobile application, categorized by functionality.

#### 1\. Authentication Endpoints

  * `POST /api/v4/auth/register-phone`
  * `POST /api/v4/auth/verify-otp`
  * `GET /api/v4/auth/me`
  * `POST /api/v4/auth/associate-society`
  * `POST /api/v4/auth/refresh-token`
  * `POST /api/v4/auth/logout`
  * `POST /api/v4/auth/biometric-setup`
  * `POST /api/v4/auth/profile-setup`

#### 2\. User & Profile Management Endpoints

  * `GET /api/v4/users/me/profile`
  * `PUT /api/v4/users/me/profile`
  * `GET /api/v4/users/me/family-members`
  * `POST /api/v4/users/me/family-members`
  * `PUT /api/v4/users/me/family-members/:id`
  * `DELETE /api/v4/users/me/family-members/:id`
  * `GET /api/v4/users/me/vehicles`
  * `POST /api/v4/users/me/vehicles`
  * `PUT /api/v4/users/me/vehicles/:id`
  * `DELETE /api/v4/users/me/vehicles/:id`
  * `GET /api/v4/users/:id/profile`
  * `PUT /api/v4/users/:id/profile/verify`

#### 3\. Society Management Endpoints

  * `GET /api/v4/societies/search`
  * `GET /api/v4/societies/:id`
  * `POST /api/v4/societies`
  * `PUT /api/v4/societies/:id`
  * `GET /api/v4/societies/:id/residents`
  * `GET /api/v4/societies/:id/admins`
  * `POST /api/v4/societies/:id/admin-roles`
  * `PUT /api/v4/societies/:id/admin-roles/:user_id`
  * `DELETE /api/v4/societies/:id/admin-roles/:user_id`

#### 4\. Maintenance System Endpoints

  * `POST /api/v4/services/maintenance`
  * `GET /api/v4/services/maintenance`
  * `GET /api/v4/services/maintenance/:id`
  * `PUT /api/v4/services/maintenance/:id/status`
  * `POST /api/v4/services/maintenance/:id/comments`
  * `GET /api/v4/services/maintenance/:id/comments`
  * `POST /api/v4/services/maintenance/:id/attachments`
  * `GET /api/v4/services/maintenance/analytics`
  * `GET /api/v4/services/maintenance/categories`

#### 5\. Billing System Endpoints

  * `GET /api/v4/services/billing/bills`
  * `GET /api/v4/services/billing/bills/:id`
  * `GET /api/v4/services/billing/bills/:id/pdf`
  * `POST /api/v4/services/billing/calculate-gst`
  * `POST /api/v4/services/billing/bills`
  * `PUT /api/v4/services/billing/bills/:id`
  * `DELETE /api/v4/services/billing/bills/:id`
  * `POST /api/v4/services/billing/payments`
  * `GET /api/v4/services/billing/payments/:id`
  * `GET /api/v4/services/billing/transactions`

#### 6\. Vendor Services Directory Endpoints

  * `GET /api/v4/services/vendors/categories`
  * `GET /api/v4/services/vendors`
  * `GET /api/v4/services/vendors/:id`
  * `GET /api/v4/services/vendors/:id/reviews`
  * `POST /api/v4/services/vendors/:id/reviews`
  * `GET /api/v4/societies/:id/emergency-contacts`
  * `POST /api/v4/services/vendors`
  * `PUT /api/v4/services/vendors/:id`
  * `DELETE /api/v4/services/vendors/:id`

#### 7\. Community Tab Endpoints

  * `GET /api/v4/community/posts`
  * `GET /api/v4/community/posts/:id`
  * `POST /api/v4/community/posts`
  * `PUT /api/v4/community/posts/:id`
  * `DELETE /api/v4/community/posts/:id`
  * `POST /api/v4/community/posts/:id/likes`
  * `GET /api/v4/community/posts/:id/comments`
  * `POST /api/v4/community/posts/:id/comments`
  * `PUT /api/v4/community/comments/:id`
  * `DELETE /api/v4/community/comments/:id`
  * `GET /api/v4/community/categories`

#### 8\. Amenities & Bookings Endpoints

  * `GET /api/v4/amenities`
  * `GET /api/v4/amenities/:id`
  * `POST /api/v4/amenities/:id/bookings`
  * `GET /api/v4/users/me/amenity-bookings`
  * `PUT /api/v4/amenities/bookings/:id/status`

#### 9\. Notices/Announcements Endpoints

  * `GET /api/v4/notices`
  * `GET /api/v4/notices/:id`
  * `POST /api/v4/notices`
  * `PUT /api/v4/notices/:id`
  * `DELETE /api/v4/notices/:id`

#### 10\. Audit Logs Endpoints

  * `GET /api/v4/audit-logs`
  * `GET /api/v4/audit-logs/:id`
  * `POST /api/v4/audit-logs/export`

#### 11\. Visitor Management Endpoints (NEW for Phase 7)

  * `GET /api/v4/visitors`
  * `GET /api/v4/visitors/:id`
  * `POST /api/v4/visitors`
  * `PUT /api/v4/visitors/:id`
  * `DELETE /api/v4/visitors/:id`
  * `POST /api/v4/visitors/:id/approve`
  * `POST /api/v4/visitors/:id/reject`
  * `POST /api/v4/visitors/:id/pre-approve`
  * `POST /api/v4/visitors/:id/check-in`
  * `POST /api/v4/visitors/:id/check-out`
  * `GET /api/v4/visitors/:id/qr-code`
  * `POST /api/v4/visitors/bulk-approve`
  * `POST /api/v4/visitors/bulk-reject`
  * `GET /api/v4/visitors/templates`
  * `GET /api/v4/visitors/analytics`

#### 12\. Multi-Society Admin Endpoints (NEW for Phase 7)

  * `GET /api/v4/admin/roles`
  * `POST /api/v4/admin/roles`
  * `PUT /api/v4/admin/roles/:id`
  * `DELETE /api/v4/admin/roles/:id`
  * `GET /api/v4/admin/sessions`
  * `POST /api/v4/admin/sessions/switch-society`
  * `POST /api/v4/admin/sessions/switch-mode`
  * `DELETE /api/v4/admin/sessions/:id`
  * `GET /api/v4/admin/permissions`
  * `GET /api/v4/admin/permissions/check`
  * `GET /api/v4/admin/escalation-path`

#### 13\. Financial Manager Endpoints (NEW for Phase 7)

  * `GET /api/v4/admin/financial/dashboard`
  * `GET /api/v4/admin/financial/stats`
  * `POST /api/v4/admin/financial/bulk-billing`
  * `POST /api/v4/admin/financial/payment-reconciliation`
  * `GET /api/v4/admin/financial/collection-reports`
  * `GET /api/v4/admin/financial/outstanding-payments`
  * `POST /api/v4/admin/financial/gst-reports`
  * `GET /api/v4/admin/financial/multi-society-summary`

#### 14\. Security Admin Endpoints (NEW for Phase 7)

  * `GET /api/v4/admin/security/dashboard`
  * `GET /api/v4/admin/security/incidents`
  * `POST /api/v4/admin/security/incidents`
  * `PUT /api/v4/admin/security/incidents/:id`
  * `POST /api/v4/admin/security/incidents/:id/resolve`
  * `POST /api/v4/admin/security/incidents/:id/escalate`
  * `GET /api/v4/admin/security/visitor-analytics`
  * `POST /api/v4/admin/security/bulk-visitor-operations`
  * `GET /api/v4/admin/security/access-logs`
  * `POST /api/v4/admin/security/emergency-alerts`

#### 15\. Society Management Endpoints (Updated for Phase 7)

  * `GET /api/v4/societies/multi-society/summary`
  * `POST /api/v4/societies/:id/settings`
  * `PUT /api/v4/societies/:id/settings`
  * `GET /api/v4/societies/:id/settings`
  * `POST /api/v4/societies/bulk-operations`
  * `GET /api/v4/societies/cross-society-analytics`
  * `POST /api/v4/societies/:id/notifications/broadcast`

#### 16\. Enhanced Audit & Analytics Endpoints (NEW for Phase 7)

  * `GET /api/v4/analytics/multi-society/dashboard`
  * `GET /api/v4/analytics/cross-society/comparison`
  * `GET /api/v4/analytics/performance/metrics`
  * `POST /api/v4/analytics/reports/generate`
  * `GET /api/v4/audit/enhanced-logs`
  * `POST /api/v4/audit/enhanced-logs/export`
  * `GET /api/v4/audit/retention-policy`

### Additional Required Database Functions and Triggers

#### Helper Functions for Enhanced RBAC (Phase 7)

```sql
-- Enhanced permission checking function
CREATE OR REPLACE FUNCTION check_user_permission(
  resource_name TEXT,
  action_name TEXT,
  target_society_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_roles user_role[];
  has_permission BOOLEAN DEFAULT FALSE;
BEGIN
  -- Get all user roles (including multi-society roles)
  SELECT ARRAY_AGG(DISTINCT role) INTO user_roles
  FROM admin_roles 
  WHERE user_id = auth.uid() 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (target_society_id IS NULL OR society_id = target_society_id);
  
  -- Check if user has required permission
  SELECT EXISTS(
    SELECT 1 FROM enhanced_permissions 
    WHERE role = ANY(user_roles)
      AND resource = resource_name 
      AND action = action_name
      AND is_active = true
      AND (
        scope = 'global' 
        OR (scope = 'society' AND target_society_id IS NOT NULL)
        OR scope = 'own'
      )
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get user societies function
CREATE OR REPLACE FUNCTION get_user_societies()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(society_id) 
  FROM admin_roles 
  WHERE user_id = auth.uid() 
    AND is_active = true 
    AND (valid_until IS NULL OR valid_until > NOW());
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Log audit events function
CREATE OR REPLACE FUNCTION log_audit_event(
  event_category audit_category,
  event_type_name TEXT,
  resource_type_name TEXT,
  resource_id_val UUID DEFAULT NULL,
  old_values_json JSONB DEFAULT NULL,
  new_values_json JSONB DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL,
  severity_level TEXT DEFAULT 'low'
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
  current_society_id UUID;
  current_session_id UUID;
  current_role user_role;
BEGIN
  -- Get current user context
  SELECT society_id INTO current_society_id FROM user_profiles WHERE id = auth.uid();
  SELECT id, role INTO current_session_id, current_role 
  FROM admin_sessions 
  WHERE user_id = auth.uid() AND status = 'active' 
  ORDER BY last_activity DESC LIMIT 1;
  
  -- Insert audit log
  INSERT INTO enhanced_audit_logs (
    user_id, society_id, session_id, category, event_type, resource_type,
    resource_id, actor_role, old_values, new_values, metadata, severity,
    ip_address, user_agent
  ) VALUES (
    auth.uid(), current_society_id, current_session_id, event_category,
    event_type_name, resource_type_name, resource_id_val, current_role,
    old_values_json, new_values_json, metadata_json, severity_level,
    inet_client_addr(), current_setting('request.headers')::json->>'user-agent'
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Database Triggers for Automatic Audit Logging

```sql
-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change
  PERFORM log_audit_event(
    'admin_actions'::audit_category,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(OLD)::jsonb END,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE row_to_json(NEW)::jsonb END,
    jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_admin_roles AFTER INSERT OR UPDATE OR DELETE ON admin_roles FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
CREATE TRIGGER audit_visitors AFTER INSERT OR UPDATE OR DELETE ON visitors FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
CREATE TRIGGER audit_bills AFTER INSERT OR UPDATE OR DELETE ON bills FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
CREATE TRIGGER audit_society_settings AFTER INSERT OR UPDATE OR DELETE ON society_settings FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();
```

### Default Permission Seed Data

```sql
-- Insert default permissions for each role
INSERT INTO enhanced_permissions (role, resource, action, scope, description) VALUES
-- Super Admin (all permissions)
('super_admin', '*', '*', 'global', 'Super admin has all permissions globally'),

-- Community Manager permissions
('community_manager', 'residents', 'read', 'society', 'View all residents in society'),
('community_manager', 'residents', 'create', 'society', 'Add new residents to society'),
('community_manager', 'residents', 'update', 'society', 'Update resident information'),
('community_manager', 'billing', 'read', 'society', 'View all billing information'),
('community_manager', 'billing', 'create', 'society', 'Create new bills'),
('community_manager', 'billing', 'update', 'society', 'Update billing information'),
('community_manager', 'visitors', 'read', 'society', 'View all visitors'),
('community_manager', 'visitors', 'approve', 'society', 'Approve visitor requests'),
('community_manager', 'maintenance', 'read', 'society', 'View maintenance requests'),
('community_manager', 'maintenance', 'approve', 'society', 'Approve maintenance requests'),
('community_manager', 'notices', 'create', 'society', 'Create society notices'),
('community_manager', 'admin_roles', 'create', 'society', 'Assign sub-admin roles'),
('community_manager', 'audit_logs', 'read', 'society', 'View audit logs for society'),

-- Financial Manager permissions
('financial_manager', 'billing', 'read', 'society', 'View billing information'),
('financial_manager', 'billing', 'create', 'society', 'Create bills'),
('financial_manager', 'billing', 'update', 'society', 'Update billing information'),
('financial_manager', 'billing', 'bulk_action', 'society', 'Perform bulk billing operations'),
('financial_manager', 'billing', 'export', 'society', 'Export billing reports'),
('financial_manager', 'payments', 'read', 'society', 'View payment information'),
('financial_manager', 'payments', 'update', 'society', 'Update payment status'),

-- Security Admin permissions
('security_admin', 'visitors', 'read', 'society', 'View all visitors'),
('security_admin', 'visitors', 'approve', 'society', 'Approve visitor requests'),
('security_admin', 'visitors', 'bulk_actions', 'society', 'Perform bulk visitor operations'),
('security_admin', 'security_incidents', 'create', 'society', 'Create security incidents'),
('security_admin', 'security_incidents', 'read', 'society', 'View security incidents'),
('security_admin', 'security_incidents', 'update', 'society', 'Update security incidents'),

-- Maintenance Admin permissions
('maintenance_admin', 'maintenance', 'read', 'society', 'View maintenance requests'),
('maintenance_admin', 'maintenance', 'update', 'society', 'Update maintenance requests'),
('maintenance_admin', 'maintenance', 'assign', 'society', 'Assign maintenance tasks'),
('maintenance_admin', 'vendors', 'read', 'society', 'View vendor information'),
('maintenance_admin', 'vendors', 'create', 'society', 'Add new vendors');
```