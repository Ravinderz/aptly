# Aptly Housing Society Management - Complete Database Schema

This is the comprehensive database schema for the Aptly React Native mobile app. The schema is designed for PostgreSQL with Supabase and includes all necessary tables, types, functions, views, and security policies.

## 1. Enable Required Extensions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;
```

## 2. Custom Types (Enums)

```sql
-- User roles in the society
CREATE TYPE user_role AS ENUM (
  'resident',
  'committee_member', 
  'secretary',
  'treasurer',
  'president',
  'admin',
  'security_guard',
  'vendor'
);

-- Visitor status tracking
CREATE TYPE visitor_status AS ENUM (
  'pending',
  'pre_approved',
  'approved',
  'rejected',
  'completed',
  'cancelled'
);

-- Visitor categories
CREATE TYPE visitor_category AS ENUM (
  'personal',
  'delivery',
  'service',
  'official',
  'emergency'
);

-- Maintenance request categories
CREATE TYPE maintenance_category AS ENUM (
  'plumbing',
  'electrical',
  'civil',
  'appliance',
  'painting',
  'cleaning',
  'carpentry',
  'pest_control',
  'elevator',
  'security',
  'garden',
  'other'
);

-- Request priority levels
CREATE TYPE request_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent',
  'emergency'
);

-- Request status tracking
CREATE TYPE request_status AS ENUM (
  'submitted',
  'reviewed',
  'approved',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'rejected'
);

-- Bill status
CREATE TYPE bill_status AS ENUM (
  'draft',
  'generated',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'refunded'
);

-- Booking status for amenities
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'in_use',
  'completed',
  'cancelled',
  'no_show'
);

-- Vendor categories
CREATE TYPE vendor_category AS ENUM (
  'plumbing',
  'electrical',
  'civil',
  'appliance',
  'painting',
  'cleaning',
  'carpentry',
  'pest_control',
  'security',
  'gardening',
  'laundry',
  'catering',
  'other'
);

-- Post categories for community
CREATE TYPE post_category AS ENUM (
  'announcement',
  'buy_sell',
  'events',
  'lost_found',
  'help',
  'feedback',
  'general'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'push',
  'email',
  'sms',
  'whatsapp',
  'in_app'
);

-- Notification status
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'read',
  'failed'
);
```

## 3. Core Tables

### 3.1 Societies Table

```sql
CREATE TABLE public.societies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  code varchar(20) NOT NULL UNIQUE,
  address text NOT NULL,
  city varchar(100) NOT NULL,
  state varchar(100) NOT NULL,
  pin_code varchar(10) NOT NULL CHECK (pin_code ~ '^[1-9][0-9]{5}$'),
  total_flats integer NOT NULL CHECK (total_flats > 0),
  total_buildings integer DEFAULT 1 CHECK (total_buildings > 0),
  gst_number varchar(15) CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  registration_number varchar(50),
  contact_email varchar(255) CHECK (contact_email ~ '^[^@]+@[^@]+\.[^@]+$'),
  contact_phone varchar(15) CHECK (contact_phone ~ '^(\+91)?[6-9]\d{9}$'),
  maintenance_amount decimal(10,2) DEFAULT 0 CHECK (maintenance_amount >= 0),
  amenity_booking_advance_days integer DEFAULT 30 CHECK (amenity_booking_advance_days >= 0),
  visitor_approval_required boolean DEFAULT true,
  building_names text[] DEFAULT '{}',
  floor_config jsonb DEFAULT '{}',
  society_logo_url text,
  emergency_contact varchar(15),
  office_hours jsonb DEFAULT '{"start": "09:00", "end": "18:00"}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_societies_code ON public.societies(code);
CREATE INDEX idx_societies_active ON public.societies(is_active) WHERE is_active = true;
```

### 3.2 User Profiles Table

```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone varchar(15) NOT NULL UNIQUE CHECK (phone ~ '^(\+91)?[6-9]\d{9}$'),
  full_name varchar(255) NOT NULL,
  email varchar(255) CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  role user_role NOT NULL,
  society_id uuid REFERENCES public.societies(id),
  flat_number varchar(10),
  building_name varchar(50),
  floor_number integer CHECK (floor_number > 0),
  is_owner boolean DEFAULT false,
  is_primary_contact boolean DEFAULT false,
  is_tenant boolean DEFAULT false,
  move_in_date date,
  lease_expiry_date date,
  
  -- Personal information
  date_of_birth date,
  occupation varchar(100),
  company_name varchar(100),
  work_address text,
  
  -- Emergency contact
  emergency_contact_name varchar(255),
  emergency_contact_phone varchar(15) CHECK (emergency_contact_phone ~ '^(\+91)?[6-9]\d{9}$'),
  emergency_contact_relation varchar(50),
  
  -- Profile and documents
  profile_image_url text,
  aadhar_number varchar(12) CHECK (aadhar_number ~ '^[0-9]{12}$'),
  pan_number varchar(10) CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  
  -- Verification status
  is_verified boolean DEFAULT false,
  verification_requested_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  verification_notes text,
  
  -- App settings
  fcm_token text,
  device_info jsonb DEFAULT '{}',
  app_preferences jsonb DEFAULT '{}',
  
  -- Status and timestamps
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX idx_user_profiles_society ON public.user_profiles(society_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_verified ON public.user_profiles(is_verified);
CREATE INDEX idx_user_profiles_flat ON public.user_profiles(society_id, building_name, flat_number);

-- Create unique constraint for primary contact per flat
CREATE UNIQUE INDEX idx_unique_primary_contact 
ON public.user_profiles(society_id, building_name, flat_number) 
WHERE is_primary_contact = true;
```

### 3.3 Family Members Table

```sql
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  relationship varchar(50) NOT NULL,
  age integer CHECK (age > 0 AND age < 150),
  phone varchar(15) CHECK (phone ~ '^(\+91)?[6-9]\d{9}$'),
  email varchar(255) CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  date_of_birth date,
  occupation varchar(100),
  aadhar_number varchar(12) CHECK (aadhar_number ~ '^[0-9]{12}$'),
  profile_image_url text,
  emergency_contact boolean DEFAULT false,
  is_resident boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_family_members_active ON public.family_members(is_active) WHERE is_active = true;
```

### 3.4 Vehicles Table

```sql
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  vehicle_type varchar(20) CHECK (vehicle_type IN ('car', 'bike', 'bicycle', 'scooter', 'other')),
  vehicle_number varchar(20) NOT NULL,
  brand varchar(50),
  model varchar(50),
  color varchar(30),
  year_of_manufacture integer CHECK (year_of_manufacture >= 1900 AND year_of_manufacture <= EXTRACT(YEAR FROM now())),
  
  -- Registration and insurance
  registration_document_url text,
  insurance_document_url text,
  insurance_expiry_date date,
  pollution_certificate_url text,
  pollution_expiry_date date,
  
  -- Parking information
  parking_slot varchar(20),
  parking_type varchar(20) DEFAULT 'assigned' CHECK (parking_type IN ('assigned', 'visitor', 'temporary')),
  monthly_parking_fee decimal(8,2) DEFAULT 0,
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_vehicles_user ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_number ON public.vehicles(vehicle_number);
CREATE INDEX idx_vehicles_parking ON public.vehicles(parking_slot) WHERE parking_slot IS NOT NULL;
CREATE INDEX idx_vehicles_active ON public.vehicles(is_active) WHERE is_active = true;
```

## 4. Visitor Management Tables

### 4.1 Visitors Table

```sql
CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  host_user_id uuid REFERENCES public.user_profiles(id),
  
  -- Visitor information
  name varchar(255) NOT NULL,
  contact_number varchar(15) NOT NULL CHECK (contact_number ~ '^(\+91)?[6-9]\d{9}$'),
  visitor_id_proof varchar(20), -- Aadhar, PAN, DL, etc.
  visitor_photo_url text,
  company_name varchar(100),
  
  -- Visit details
  visit_date date NOT NULL,
  visit_time time NOT NULL,
  expected_duration interval DEFAULT '2 hours',
  visit_purpose text NOT NULL,
  category visitor_category DEFAULT 'personal',
  flat_number varchar(10) NOT NULL,
  building_name varchar(50),
  
  -- Vehicle details
  vehicle_number varchar(20),
  vehicle_type varchar(20),
  
  -- Approval workflow
  status visitor_status DEFAULT 'pending',
  approved_by uuid REFERENCES public.user_profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  
  -- Entry/Exit tracking
  entry_time timestamptz,
  exit_time timestamptz,
  actual_duration interval,
  security_guard_entry uuid REFERENCES public.user_profiles(id),
  security_guard_exit uuid REFERENCES public.user_profiles(id),
  
  -- QR Code
  qr_code_data text,
  qr_code_url text,
  qr_code_expires_at timestamptz,
  
  -- Additional fields
  special_instructions text,
  recurring_visit boolean DEFAULT false,
  recurring_schedule jsonb,
  metadata jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_visitors_society ON public.visitors(society_id);
CREATE INDEX idx_visitors_host ON public.visitors(host_user_id);
CREATE INDEX idx_visitors_date ON public.visitors(visit_date);
CREATE INDEX idx_visitors_status ON public.visitors(status);
CREATE INDEX idx_visitors_flat ON public.visitors(society_id, building_name, flat_number);
CREATE INDEX idx_visitors_contact ON public.visitors(contact_number);
```

### 4.2 Visitor Templates Table

```sql
CREATE TABLE public.visitor_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  template_name varchar(100) NOT NULL,
  visitor_name varchar(255),
  contact_number varchar(15),
  category visitor_category DEFAULT 'personal',
  visit_purpose text,
  company_name varchar(100),
  default_duration interval DEFAULT '2 hours',
  is_pre_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX idx_visitor_templates_user ON public.visitor_templates(user_id);
```

## 5. Community Features Tables

### 5.1 Community Posts Table

```sql
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  author_id uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Post content
  title varchar(255),
  content text NOT NULL,
  category post_category DEFAULT 'general',
  tags text[] DEFAULT '{}',
  
  -- Media attachments
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  documents text[] DEFAULT '{}',
  
  -- Targeting
  is_announcement boolean DEFAULT false,
  target_buildings text[] DEFAULT '{}',
  target_flats text[] DEFAULT '{}',
  target_roles user_role[] DEFAULT '{}',
  
  -- Interactions
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  
  -- Status and visibility
  is_active boolean DEFAULT true,
  is_pinned boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  expires_at timestamptz,
  
  -- Moderation
  is_moderated boolean DEFAULT false,
  moderated_by uuid REFERENCES public.user_profiles(id),
  moderated_at timestamptz,
  moderation_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_community_posts_society ON public.community_posts(society_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_posts_category ON public.community_posts(category);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_active ON public.community_posts(is_active) WHERE is_active = true;
CREATE INDEX idx_community_posts_pinned ON public.community_posts(is_pinned, created_at DESC) WHERE is_pinned = true;
```

### 5.2 Post Comments Table

```sql
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.user_profiles(id),
  parent_comment_id uuid REFERENCES public.post_comments(id),
  
  -- Comment content
  content text NOT NULL,
  images text[] DEFAULT '{}',
  
  -- Interactions
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  
  -- Status
  is_active boolean DEFAULT true,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_author ON public.post_comments(author_id);
CREATE INDEX idx_post_comments_parent ON public.post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_created ON public.post_comments(created_at DESC);
```

### 5.3 Post Likes Table

```sql
CREATE TABLE public.post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create unique constraints and indexes
CREATE UNIQUE INDEX idx_unique_post_like ON public.post_likes(post_id, user_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_comment_like ON public.post_likes(comment_id, user_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_post_likes_user ON public.post_likes(user_id);
```

### 5.4 Post Mentions Table

```sql
CREATE TABLE public.post_mentions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mentioned_by_user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Create indexes
CREATE INDEX idx_post_mentions_mentioned_user ON public.post_mentions(mentioned_user_id);
CREATE INDEX idx_post_mentions_post ON public.post_mentions(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_post_mentions_comment ON public.post_mentions(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_post_mentions_unread ON public.post_mentions(mentioned_user_id, is_read) WHERE is_read = false;
```

## 6. Maintenance Management Tables

### 6.1 Maintenance Requests Table

```sql
CREATE TABLE public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  resident_id uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Request details
  title varchar(255) NOT NULL,
  description text NOT NULL,
  category maintenance_category NOT NULL,
  subcategory varchar(100),
  priority request_priority DEFAULT 'medium',
  
  -- Location information
  location_type varchar(20) DEFAULT 'flat' CHECK (location_type IN ('flat', 'common_area', 'building')),
  flat_number varchar(10),
  building_name varchar(50),
  specific_location text, -- Bedroom, Kitchen, Lobby, etc.
  
  -- Media attachments
  photos text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  voice_note_url text,
  
  -- Workflow status
  status request_status DEFAULT 'submitted',
  assigned_vendor_id uuid REFERENCES public.vendors(id),
  assigned_by uuid REFERENCES public.user_profiles(id),
  assigned_at timestamptz,
  
  -- Cost and timeline
  estimated_cost decimal(10,2) CHECK (estimated_cost >= 0),
  approved_budget decimal(10,2) CHECK (approved_budget >= 0),
  actual_cost decimal(10,2) CHECK (actual_cost >= 0),
  estimated_completion_date date,
  actual_completion_date timestamptz,
  
  -- Feedback and rating
  resident_rating integer CHECK (resident_rating >= 1 AND resident_rating <= 5),
  resident_feedback text,
  vendor_rating integer CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
  vendor_feedback text,
  
  -- Committee notes and approval
  committee_notes text,
  approval_required boolean DEFAULT false,
  approved_by uuid REFERENCES public.user_profiles(id),
  approved_at timestamptz,
  approval_notes text,
  
  -- Additional metadata
  urgency_reason text,
  preferred_time_slot varchar(50),
  requires_flat_access boolean DEFAULT true,
  resident_available boolean DEFAULT true,
  alternative_contact varchar(15),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_maintenance_requests_society ON public.maintenance_requests(society_id);
CREATE INDEX idx_maintenance_requests_resident ON public.maintenance_requests(resident_id);
CREATE INDEX idx_maintenance_requests_vendor ON public.maintenance_requests(assigned_vendor_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX idx_maintenance_requests_category ON public.maintenance_requests(category);
CREATE INDEX idx_maintenance_requests_created ON public.maintenance_requests(created_at DESC);
```

### 6.2 Maintenance Request Updates Table

```sql
CREATE TABLE public.maintenance_request_updates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  updated_by uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Update information
  update_type varchar(50) NOT NULL, -- status_change, cost_update, note_added, etc.
  previous_status request_status,
  new_status request_status,
  notes text,
  photos text[] DEFAULT '{}',
  
  -- Cost updates
  previous_cost decimal(10,2),
  new_cost decimal(10,2),
  
  -- Timeline updates
  previous_date date,
  new_date date,
  
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_maintenance_updates_request ON public.maintenance_request_updates(request_id);
CREATE INDEX idx_maintenance_updates_user ON public.maintenance_request_updates(updated_by);
CREATE INDEX idx_maintenance_updates_created ON public.maintenance_request_updates(created_at DESC);
```

## 7. Vendor Management Tables

### 7.1 Vendors Table

```sql
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic information
  name varchar(255) NOT NULL,
  category vendor_category NOT NULL,
  subcategories varchar(100)[] DEFAULT '{}',
  description text,
  
  -- Contact information
  contact_person varchar(255),
  phone varchar(15) NOT NULL CHECK (phone ~ '^(\+91)?[6-9]\d{9}$'),
  alternative_phone varchar(15) CHECK (alternative_phone ~ '^(\+91)?[6-9]\d{9}$'),
  email varchar(255) CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  whatsapp_number varchar(15) CHECK (whatsapp_number ~ '^(\+91)?[6-9]\d{9}$'),
  
  -- Business address
  address text,
  city varchar(100),
  state varchar(100),
  pin_code varchar(10) CHECK (pin_code ~ '^[1-9][0-9]{5}$'),
  
  -- Business documents
  gst_number varchar(15) CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan_number varchar(10) CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  business_license varchar(50),
  verification_documents text[] DEFAULT '{}',
  
  -- Service details
  services_offered text[] DEFAULT '{}',
  service_areas text[] DEFAULT '{}', -- Areas they serve
  minimum_charge decimal(8,2) DEFAULT 0,
  hourly_rate decimal(8,2),
  emergency_available boolean DEFAULT false,
  emergency_charges decimal(8,2),
  
  -- Availability
  working_days varchar(20)[] DEFAULT '{}', -- ['monday', 'tuesday', ...]
  working_hours jsonb DEFAULT '{"start": "09:00", "end": "18:00"}',
  emergency_hours jsonb,
  
  -- Performance metrics
  rating decimal(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs integer DEFAULT 0 CHECK (total_jobs >= 0),
  completed_jobs integer DEFAULT 0 CHECK (completed_jobs >= 0),
  cancelled_jobs integer DEFAULT 0 CHECK (cancelled_jobs >= 0),
  average_completion_time interval,
  
  -- Verification and status
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES public.user_profiles(id),
  verified_at timestamptz,
  verification_notes text,
  background_check_status varchar(20) DEFAULT 'pending',
  
  -- Status
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_emergency_vendor boolean DEFAULT false,
  
  -- Additional information
  profile_image_url text,
  portfolio_images text[] DEFAULT '{}',
  certificates text[] DEFAULT '{}',
  insurance_details jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_vendors_category ON public.vendors(category);
CREATE INDEX idx_vendors_phone ON public.vendors(phone);
CREATE INDEX idx_vendors_rating ON public.vendors(rating DESC);
CREATE INDEX idx_vendors_active ON public.vendors(is_active) WHERE is_active = true;
CREATE INDEX idx_vendors_verified ON public.vendors(is_verified) WHERE is_verified = true;
CREATE INDEX idx_vendors_emergency ON public.vendors(is_emergency_vendor) WHERE is_emergency_vendor = true;
CREATE INDEX idx_vendors_location ON public.vendors(city, state);
```

### 7.2 Vendor Reviews Table

```sql
CREATE TABLE public.vendor_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  maintenance_request_id uuid REFERENCES public.maintenance_requests(id),
  reviewer_id uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Review details
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(255),
  review_text text,
  
  -- Detailed ratings
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating integer CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review metadata
  service_date date,
  would_recommend boolean,
  photos text[] DEFAULT '{}',
  
  -- Status
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_vendor_reviews_vendor ON public.vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_reviewer ON public.vendor_reviews(reviewer_id);
CREATE INDEX idx_vendor_reviews_request ON public.vendor_reviews(maintenance_request_id);
CREATE INDEX idx_vendor_reviews_rating ON public.vendor_reviews(rating DESC);
CREATE INDEX idx_vendor_reviews_active ON public.vendor_reviews(is_active) WHERE is_active = true;
```

## 8. Billing and Payment Tables

### 8.1 Maintenance Bills Table

```sql
CREATE TABLE public.maintenance_bills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  resident_id uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Bill details
  bill_number varchar(50) NOT NULL UNIQUE,
  billing_month date NOT NULL,
  billing_period_start date NOT NULL,
  billing_period_end date NOT NULL,
  
  -- Charges breakdown
  base_maintenance_amount decimal(10,2) NOT NULL CHECK (base_maintenance_amount >= 0),
  water_charges decimal(10,2) DEFAULT 0 CHECK (water_charges >= 0),
  electricity_charges decimal(10,2) DEFAULT 0 CHECK (electricity_charges >= 0),
  common_electricity decimal(10,2) DEFAULT 0 CHECK (common_electricity >= 0),
  generator_charges decimal(10,2) DEFAULT 0 CHECK (generator_charges >= 0),
  parking_charges decimal(10,2) DEFAULT 0 CHECK (parking_charges >= 0),
  amenity_charges decimal(10,2) DEFAULT 0 CHECK (amenity_charges >= 0),
  security_charges decimal(10,2) DEFAULT 0 CHECK (security_charges >= 0),
  admin_charges decimal(10,2) DEFAULT 0 CHECK (admin_charges >= 0),
  repair_maintenance decimal(10,2) DEFAULT 0 CHECK (repair_maintenance >= 0),
  other_charges decimal(10,2) DEFAULT 0 CHECK (other_charges >= 0),
  other_charges_description text,
  
  -- Penalties and adjustments
  late_payment_fee decimal(10,2) DEFAULT 0 CHECK (late_payment_fee >= 0),
  interest_charges decimal(10,2) DEFAULT 0 CHECK (interest_charges >= 0),
  adjustment_amount decimal(10,2) DEFAULT 0,
  adjustment_description text,
  previous_due decimal(10,2) DEFAULT 0,
  
  -- Totals
  sub_total decimal(10,2) NOT NULL CHECK (sub_total >= 0),
  discount_amount decimal(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  discount_description text,
  
  -- GST calculation
  gst_applicable boolean DEFAULT false,
  cgst_rate decimal(5,2) DEFAULT 0,
  sgst_rate decimal(5,2) DEFAULT 0,
  igst_rate decimal(5,2) DEFAULT 0,
  cgst_amount decimal(10,2) DEFAULT 0 CHECK (cgst_amount >= 0),
  sgst_amount decimal(10,2) DEFAULT 0 CHECK (sgst_amount >= 0),
  igst_amount decimal(10,2) DEFAULT 0 CHECK (igst_amount >= 0),
  total_gst decimal(10,2) DEFAULT 0 CHECK (total_gst >= 0),
  
  -- Final amount
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  rounded_amount decimal(10,2) NOT NULL CHECK (rounded_amount >= 0),
  
  -- Payment details
  status bill_status DEFAULT 'draft',
  due_date date NOT NULL,
  payment_date timestamptz,
  payment_method varchar(50),
  payment_reference varchar(100),
  payment_amount decimal(10,2),
  
  -- Document URLs
  bill_pdf_url text,
  receipt_pdf_url text,
  
  -- Metadata
  consumption_units integer DEFAULT 0, -- For utility bills
  rate_per_unit decimal(8,4),
  meter_reading_previous integer,
  meter_reading_current integer,
  usage_details jsonb DEFAULT '{}',
  
  -- Workflow
  generated_by uuid REFERENCES public.user_profiles(id),
  approved_by uuid REFERENCES public.user_profiles(id),
  sent_by uuid REFERENCES public.user_profiles(id),
  sent_at timestamptz,
  
  -- Reminders and notifications
  first_reminder_sent_at timestamptz,
  second_reminder_sent_at timestamptz,
  final_notice_sent_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_maintenance_bills_society ON public.maintenance_bills(society_id);
CREATE INDEX idx_maintenance_bills_resident ON public.maintenance_bills(resident_id);
CREATE INDEX idx_maintenance_bills_month ON public.maintenance_bills(billing_month);
CREATE INDEX idx_maintenance_bills_status ON public.maintenance_bills(status);
CREATE INDEX idx_maintenance_bills_due_date ON public.maintenance_bills(due_date);
CREATE INDEX idx_maintenance_bills_number ON public.maintenance_bills(bill_number);
CREATE UNIQUE INDEX idx_unique_resident_bill_month ON public.maintenance_bills(resident_id, billing_month);
```

### 8.2 Payments Table

```sql
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id uuid REFERENCES public.maintenance_bills(id),
  resident_id uuid NOT NULL REFERENCES public.user_profiles(id),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  
  -- Payment details
  payment_type varchar(20) DEFAULT 'maintenance' CHECK (payment_type IN ('maintenance', 'amenity', 'penalty', 'other')),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  convenience_fee decimal(8,2) DEFAULT 0 CHECK (convenience_fee >= 0),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount > 0),
  
  -- Payment method
  payment_method varchar(30) NOT NULL, -- upi, card, netbanking, cash, cheque
  payment_mode varchar(20), -- online, offline
  
  -- Gateway details
  gateway_provider varchar(30), -- razorpay, payu, phonepe, etc.
  gateway_payment_id varchar(100),
  gateway_order_id varchar(100),
  gateway_signature varchar(200),
  gateway_response jsonb DEFAULT '{}',
  
  -- Bank/UPI details
  bank_name varchar(100),
  upi_transaction_id varchar(50),
  cheque_number varchar(20),
  cheque_date date,
  
  -- Status and workflow
  status payment_status DEFAULT 'pending',
  failure_reason text,
  failure_code varchar(20),
  
  -- Settlement details
  settlement_date date,
  settlement_amount decimal(10,2),
  settlement_charges decimal(8,2),
  net_settlement decimal(10,2),
  
  -- Receipts and documents
  receipt_number varchar(50),
  receipt_pdf_url text,
  transaction_screenshot_url text,
  
  -- Timestamps
  initiated_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  
  -- Refund details
  refund_amount decimal(10,2),
  refund_reference varchar(100),
  refund_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_payments_bill ON public.payments(bill_id);
CREATE INDEX idx_payments_resident ON public.payments(resident_id);
CREATE INDEX idx_payments_society ON public.payments(society_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_method ON public.payments(payment_method);
CREATE INDEX idx_payments_gateway_id ON public.payments(gateway_payment_id);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);
```

### 8.3 Society Expenses Table

```sql
CREATE TABLE public.society_expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  
  -- Expense details
  expense_number varchar(50),
  category varchar(50) NOT NULL,
  subcategory varchar(50),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  
  -- Financial details
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  gst_applicable boolean DEFAULT false,
  gst_amount decimal(10,2) DEFAULT 0 CHECK (gst_amount >= 0),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Vendor and invoice details
  vendor_id uuid REFERENCES public.vendors(id),
  invoice_number varchar(50),
  invoice_date date,
  invoice_url text,
  
  -- Approval workflow
  approval_required boolean DEFAULT true,
  requested_by uuid NOT NULL REFERENCES public.user_profiles(id),
  approved_by uuid REFERENCES public.user_profiles(id),
  approval_date timestamptz,
  approval_notes text,
  
  -- Payment status
  payment_status varchar(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid', 'rejected', 'cancelled')),
  payment_date date,
  payment_method varchar(30),
  payment_reference varchar(100),
  
  -- Documents
  receipt_url text,
  supporting_documents text[] DEFAULT '{}',
  
  -- Budget tracking
  budget_category varchar(50),
  financial_year varchar(10),
  quarter varchar(10),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_society_expenses_society ON public.society_expenses(society_id);
CREATE INDEX idx_society_expenses_vendor ON public.society_expenses(vendor_id);
CREATE INDEX idx_society_expenses_category ON public.society_expenses(category);
CREATE INDEX idx_society_expenses_status ON public.society_expenses(payment_status);
CREATE INDEX idx_society_expenses_requested_by ON public.society_expenses(requested_by);
CREATE INDEX idx_society_expenses_financial_year ON public.society_expenses(financial_year);
```

## 9. Amenity Management Tables

### 9.1 Amenities Table

```sql
CREATE TABLE public.amenities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  
  -- Basic information
  name varchar(255) NOT NULL,
  description text,
  category varchar(50), -- gym, swimming_pool, clubhouse, etc.
  location varchar(255),
  
  -- Capacity and timing
  capacity integer CHECK (capacity > 0),
  min_booking_duration interval DEFAULT '1 hour',
  max_booking_duration interval DEFAULT '4 hours',
  booking_slot_duration interval DEFAULT '30 minutes',
  
  -- Pricing
  hourly_rate decimal(8,2) DEFAULT 0 CHECK (hourly_rate >= 0),
  daily_rate decimal(8,2) DEFAULT 0 CHECK (daily_rate >= 0),
  monthly_rate decimal(10,2) DEFAULT 0 CHECK (monthly_rate >= 0),
  deposit_amount decimal(8,2) DEFAULT 0 CHECK (deposit_amount >= 0),
  security_deposit decimal(8,2) DEFAULT 0 CHECK (security_deposit >= 0),
  
  -- Booking rules
  advance_booking_days integer DEFAULT 30 CHECK (advance_booking_days >= 0),
  max_bookings_per_user_per_month integer DEFAULT 4,
  max_hours_per_booking integer DEFAULT 8 CHECK (max_hours_per_booking > 0),
  cancellation_hours integer DEFAULT 24,
  cancellation_charges_percentage decimal(5,2) DEFAULT 0,
  
  -- Availability
  operating_hours jsonb DEFAULT '{"start": "06:00", "end": "22:00"}',
  operating_days varchar(20)[] DEFAULT '{}',
  maintenance_days varchar(20)[] DEFAULT '{}',
  holiday_schedule jsonb DEFAULT '{}',
  
  -- Rules and restrictions
  booking_rules jsonb DEFAULT '{}',
  terms_and_conditions text,
  age_restrictions varchar(100),
  guest_policy text,
  maximum_guests integer DEFAULT 0,
  
  -- Status and features
  is_active boolean DEFAULT true,
  requires_approval boolean DEFAULT false,
  auto_approval boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  -- Media and documents
  images text[] DEFAULT '{}',
  amenity_manual_url text,
  safety_guidelines text,
  
  -- Contact information
  manager_name varchar(255),
  manager_phone varchar(15),
  emergency_contact varchar(15),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_amenities_society ON public.amenities(society_id);
CREATE INDEX idx_amenities_category ON public.amenities(category);
CREATE INDEX idx_amenities_active ON public.amenities(is_active) WHERE is_active = true;
```

### 9.2 Amenity Bookings Table

```sql
CREATE TABLE public.amenity_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  amenity_id uuid NOT NULL REFERENCES public.amenities(id),
  resident_id uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Booking details
  booking_date date NOT NULL CHECK (booking_date >= CURRENT_DATE),
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration interval NOT NULL,
  
  -- Purpose and guests
  purpose text,
  guest_count integer DEFAULT 0 CHECK (guest_count >= 0),
  guest_details jsonb DEFAULT '[]',
  special_requests text,
  
  -- Financial details
  base_amount decimal(8,2) CHECK (base_amount >= 0),
  additional_charges decimal(8,2) DEFAULT 0 CHECK (additional_charges >= 0),
  total_amount decimal(8,2) CHECK (total_amount >= 0),
  deposit_paid decimal(8,2) DEFAULT 0 CHECK (deposit_paid >= 0),
  refundable_deposit decimal(8,2) DEFAULT 0,
  
  -- Status and approval
  status booking_status DEFAULT 'pending',
  approved_by uuid REFERENCES public.user_profiles(id),
  approved_at timestamptz,
  approval_notes text,
  
  -- Cancellation details
  cancellation_reason text,
  cancelled_by uuid REFERENCES public.user_profiles(id),
  cancelled_at timestamptz,
  cancellation_charges decimal(8,2) DEFAULT 0,
  refund_amount decimal(8,2) DEFAULT 0,
  
  -- Usage tracking
  check_in_time timestamptz,
  check_out_time timestamptz,
  actual_duration interval,
  no_show boolean DEFAULT false,
  
  -- Feedback and rating
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback text,
  facility_rating integer CHECK (facility_rating >= 1 AND facility_rating <= 5),
  
  -- Payment details
  payment_status payment_status DEFAULT 'pending',
  payment_date timestamptz,
  payment_reference varchar(100),
  
  -- Documents and media
  booking_confirmation_url text,
  damage_photos text[] DEFAULT '{}',
  damage_charges decimal(8,2) DEFAULT 0,
  damage_description text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (start_time < end_time),
  CHECK (booking_date > CURRENT_DATE OR (booking_date = CURRENT_DATE AND start_time > CURRENT_TIME))
);

-- Create indexes
CREATE INDEX idx_amenity_bookings_amenity ON public.amenity_bookings(amenity_id);
CREATE INDEX idx_amenity_bookings_resident ON public.amenity_bookings(resident_id);
CREATE INDEX idx_amenity_bookings_date ON public.amenity_bookings(booking_date);
CREATE INDEX idx_amenity_bookings_status ON public.amenity_bookings(status);
CREATE INDEX idx_amenity_bookings_datetime ON public.amenity_bookings(booking_date, start_time);

-- Unique constraint to prevent double booking
CREATE UNIQUE INDEX idx_unique_amenity_booking 
ON public.amenity_bookings(amenity_id, booking_date, start_time) 
WHERE status NOT IN ('cancelled', 'no_show');
```

## 10. Notification and Communication Tables

### 10.1 Notices Table

```sql
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  created_by uuid NOT NULL REFERENCES public.user_profiles(id),
  
  -- Notice content
  title varchar(500) NOT NULL,
  content text NOT NULL,
  summary varchar(1000), -- Short summary for preview
  
  -- Classification
  category varchar(50) DEFAULT 'general', -- maintenance, security, events, etc.
  priority varchar(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notice_type varchar(30) DEFAULT 'information', -- information, warning, celebration, etc.
  
  -- Targeting
  target_type varchar(20) DEFAULT 'all' CHECK (target_type IN ('all', 'building', 'flat', 'role', 'custom')),
  target_buildings text[] DEFAULT '{}',
  target_flats text[] DEFAULT '{}',
  target_user_ids uuid[] DEFAULT '{}',
  target_roles user_role[] DEFAULT '{}',
  
  -- Visibility and scheduling
  is_active boolean DEFAULT true,
  is_pinned boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  publish_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  
  -- Media attachments
  images text[] DEFAULT '{}',
  documents text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  
  -- Interaction tracking
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_enabled boolean DEFAULT false,
  
  -- Acknowledgment
  requires_acknowledgment boolean DEFAULT false,
  acknowledgment_count integer DEFAULT 0,
  acknowledgment_deadline timestamptz,
  
  -- Event details (if notice is about an event)
  event_date timestamptz,
  event_location varchar(255),
  event_capacity integer,
  registration_required boolean DEFAULT false,
  registration_deadline timestamptz,
  
  -- Contact information
  contact_person varchar(255),
  contact_phone varchar(15),
  contact_email varchar(255),
  
  -- Approval workflow
  requires_approval boolean DEFAULT false,
  approved_by uuid REFERENCES public.user_profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notices_society ON public.notices(society_id);
CREATE INDEX idx_notices_created_by ON public.notices(created_by);
CREATE INDEX idx_notices_category ON public.notices(category);
CREATE INDEX idx_notices_priority ON public.notices(priority);
CREATE INDEX idx_notices_active ON public.notices(is_active) WHERE is_active = true;
CREATE INDEX idx_notices_pinned ON public.notices(is_pinned, created_at DESC) WHERE is_pinned = true;
CREATE INDEX idx_notices_publish_date ON public.notices(publish_at DESC);
CREATE INDEX idx_notices_expires_at ON public.notices(expires_at) WHERE expires_at IS NOT NULL;
```

### 10.2 Notice Acknowledgments Table

```sql
CREATE TABLE public.notice_acknowledgments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  acknowledged_at timestamptz DEFAULT now(),
  notes text,
  
  UNIQUE(notice_id, user_id)
);

-- Create indexes
CREATE INDEX idx_notice_acknowledgments_notice ON public.notice_acknowledgments(notice_id);
CREATE INDEX idx_notice_acknowledgments_user ON public.notice_acknowledgments(user_id);
```

### 10.3 Notification Logs Table

```sql
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.user_profiles(id),
  
  -- Notification content
  title varchar(255) NOT NULL,
  message text NOT NULL,
  category varchar(50) NOT NULL, -- visitor, maintenance, billing, etc.
  subcategory varchar(50),
  
  -- Delivery details
  type notification_type NOT NULL,
  status notification_status DEFAULT 'pending',
  delivery_attempt integer DEFAULT 1 CHECK (delivery_attempt > 0),
  max_attempts integer DEFAULT 3,
  
  -- Related entities
  related_entity_type varchar(50), -- visitor, maintenance_request, bill, etc.
  related_entity_id uuid,
  
  -- Delivery tracking
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  
  -- Channel specific data
  push_notification_id varchar(100),
  email_message_id varchar(100),
  sms_message_id varchar(100),
  whatsapp_message_id varchar(100),
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  device_info jsonb DEFAULT '{}',
  
  -- Scheduling
  scheduled_at timestamptz,
  retry_at timestamptz,
  expires_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_category ON public.notification_logs(category);
CREATE INDEX idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX idx_notification_logs_created ON public.notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_scheduled ON public.notification_logs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_notification_logs_retry ON public.notification_logs(retry_at) WHERE retry_at IS NOT NULL;
CREATE INDEX idx_notification_logs_related ON public.notification_logs(related_entity_type, related_entity_id);
```

### 10.4 Notification Preferences Table

```sql
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Category preferences
  maintenance_enabled boolean DEFAULT true,
  billing_enabled boolean DEFAULT true,
  visitor_enabled boolean DEFAULT true,
  community_enabled boolean DEFAULT true,
  amenity_enabled boolean DEFAULT true,
  security_enabled boolean DEFAULT true,
  events_enabled boolean DEFAULT true,
  vendor_enabled boolean DEFAULT false,
  emergency_enabled boolean DEFAULT true,
  committee_enabled boolean DEFAULT true,
  
  -- Channel preferences
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  whatsapp_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  
  -- Advanced preferences
  digest_enabled boolean DEFAULT false,
  digest_frequency varchar(20) DEFAULT 'daily', -- daily, weekly, monthly
  digest_time time DEFAULT '08:00',
  
  -- Do Not Disturb
  dnd_enabled boolean DEFAULT false,
  dnd_start_time time DEFAULT '22:00',
  dnd_end_time time DEFAULT '07:00',
  dnd_weekend_enabled boolean DEFAULT false,
  
  -- Priority overrides
  emergency_override boolean DEFAULT true, -- Emergency notifications ignore DND
  urgent_override boolean DEFAULT true,    -- Urgent notifications ignore DND
  
  -- Specific notification preferences
  visitor_approval_push boolean DEFAULT true,
  visitor_arrival_push boolean DEFAULT true,
  maintenance_updates_push boolean DEFAULT true,
  bill_generated_email boolean DEFAULT true,
  bill_due_reminder_push boolean DEFAULT true,
  community_mentions_push boolean DEFAULT true,
  
  -- Language preference
  preferred_language varchar(10) DEFAULT 'en',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX idx_notification_preferences_user ON public.notification_preferences(user_id);
```

## 11. Utility Functions

### 11.1 Update Timestamps Function

```sql
-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at column
CREATE TRIGGER update_societies_updated_at BEFORE UPDATE ON public.societies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON public.visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON public.vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_bills_updated_at BEFORE UPDATE ON public.maintenance_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_society_expenses_updated_at BEFORE UPDATE ON public.society_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at BEFORE UPDATE ON public.amenities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenity_bookings_updated_at BEFORE UPDATE ON public.amenity_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_logs_updated_at BEFORE UPDATE ON public.notification_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 11.2 Post Statistics Update Functions

```sql
-- Function to update post statistics
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      -- Update likes count for post
      UPDATE public.community_posts 
      SET likes_count = (
        SELECT COUNT(*) FROM public.post_likes 
        WHERE post_id = NEW.post_id
      )
      WHERE id = NEW.post_id;
    END IF;
    
    IF NEW.comment_id IS NOT NULL THEN
      -- Update likes count for comment
      UPDATE public.post_comments 
      SET likes_count = (
        SELECT COUNT(*) FROM public.post_likes 
        WHERE comment_id = NEW.comment_id
      )
      WHERE id = NEW.comment_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      -- Update likes count for post
      UPDATE public.community_posts 
      SET likes_count = (
        SELECT COUNT(*) FROM public.post_likes 
        WHERE post_id = OLD.post_id
      )
      WHERE id = OLD.post_id;
    END IF;
    
    IF OLD.comment_id IS NOT NULL THEN
      -- Update likes count for comment
      UPDATE public.post_comments 
      SET likes_count = (
        SELECT COUNT(*) FROM public.post_likes 
        WHERE comment_id = OLD.comment_id
      )
      WHERE id = OLD.comment_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post likes
CREATE TRIGGER update_post_likes_stats
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update comments count for post
    UPDATE public.community_posts 
    SET comments_count = (
      SELECT COUNT(*) FROM public.post_comments 
      WHERE post_id = NEW.post_id AND is_active = true
    )
    WHERE id = NEW.post_id;
    
    -- Update replies count for parent comment
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE public.post_comments 
      SET replies_count = (
        SELECT COUNT(*) FROM public.post_comments 
        WHERE parent_comment_id = NEW.parent_comment_id AND is_active = true
      )
      WHERE id = NEW.parent_comment_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete (is_active = false)
    IF OLD.is_active != NEW.is_active THEN
      UPDATE public.community_posts 
      SET comments_count = (
        SELECT COUNT(*) FROM public.post_comments 
        WHERE post_id = NEW.post_id AND is_active = true
      )
      WHERE id = NEW.post_id;
      
      IF NEW.parent_comment_id IS NOT NULL THEN
        UPDATE public.post_comments 
        SET replies_count = (
          SELECT COUNT(*) FROM public.post_comments 
          WHERE parent_comment_id = NEW.parent_comment_id AND is_active = true
        )
        WHERE id = NEW.parent_comment_id;
      END IF;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = (
      SELECT COUNT(*) FROM public.post_comments 
      WHERE post_id = OLD.post_id AND is_active = true
    )
    WHERE id = OLD.post_id;
    
    IF OLD.parent_comment_id IS NOT NULL THEN
      UPDATE public.post_comments 
      SET replies_count = (
        SELECT COUNT(*) FROM public.post_comments 
        WHERE parent_comment_id = OLD.parent_comment_id AND is_active = true
      )
      WHERE id = OLD.parent_comment_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR UPDATE OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();
```

### 11.3 Vendor Rating Update Function

```sql
-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.vendors 
    SET rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.vendor_reviews 
      WHERE vendor_id = NEW.vendor_id AND is_active = true
    )
    WHERE id = NEW.vendor_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.vendors 
    SET rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0)
      FROM public.vendor_reviews 
      WHERE vendor_id = OLD.vendor_id AND is_active = true
    )
    WHERE id = OLD.vendor_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendor rating
CREATE TRIGGER update_vendor_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();
```

### 11.4 Maintenance Request Job Count Update

```sql
-- Function to update vendor job counts
CREATE OR REPLACE FUNCTION update_vendor_job_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.assigned_vendor_id IS NOT NULL THEN
    UPDATE public.vendors 
    SET total_jobs = total_jobs + 1
    WHERE id = NEW.assigned_vendor_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vendor assignment change
    IF OLD.assigned_vendor_id IS DISTINCT FROM NEW.assigned_vendor_id THEN
      -- Decrease count for old vendor
      IF OLD.assigned_vendor_id IS NOT NULL THEN
        UPDATE public.vendors 
        SET total_jobs = GREATEST(total_jobs - 1, 0)
        WHERE id = OLD.assigned_vendor_id;
      END IF;
      
      -- Increase count for new vendor
      IF NEW.assigned_vendor_id IS NOT NULL THEN
        UPDATE public.vendors 
        SET total_jobs = total_jobs + 1
        WHERE id = NEW.assigned_vendor_id;
      END IF;
    END IF;
    
    -- Handle status change to completed
    IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.assigned_vendor_id IS NOT NULL THEN
      UPDATE public.vendors 
      SET completed_jobs = completed_jobs + 1
      WHERE id = NEW.assigned_vendor_id;
    ELSIF OLD.status = 'completed' AND NEW.status != 'completed' AND NEW.assigned_vendor_id IS NOT NULL THEN
      UPDATE public.vendors 
      SET completed_jobs = GREATEST(completed_jobs - 1, 0)
      WHERE id = NEW.assigned_vendor_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendor job counts
CREATE TRIGGER update_vendor_job_counts_trigger
  AFTER INSERT OR UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_vendor_job_counts();
```

## 12. Views for Common Queries

### 12.1 Resident Details View

```sql
CREATE VIEW public.resident_details AS
SELECT 
  up.id,
  up.phone,
  up.full_name,
  up.email,
  up.role,
  up.flat_number,
  up.building_name,
  up.floor_number,
  up.is_owner,
  up.is_primary_contact,
  up.is_verified,
  up.profile_image_url,
  up.created_at,
  
  -- Society details
  s.name as society_name,
  s.code as society_code,
  s.city,
  s.state,
  
  -- Family members count
  (SELECT COUNT(*) FROM public.family_members fm 
   WHERE fm.user_id = up.id AND fm.is_active = true) as family_members_count,
   
  -- Vehicles count
  (SELECT COUNT(*) FROM public.vehicles v 
   WHERE v.user_id = up.id AND v.is_active = true) as vehicles_count,
   
  -- Pending maintenance requests
  (SELECT COUNT(*) FROM public.maintenance_requests mr 
   WHERE mr.resident_id = up.id AND mr.status NOT IN ('completed', 'cancelled')) as pending_requests_count,
   
  -- Outstanding bills
  (SELECT COUNT(*) FROM public.maintenance_bills mb 
   WHERE mb.resident_id = up.id AND mb.status IN ('generated', 'sent', 'overdue')) as outstanding_bills_count

FROM public.user_profiles up
LEFT JOIN public.societies s ON up.society_id = s.id
WHERE up.role IN ('resident', 'committee_member', 'secretary', 'treasurer', 'president');
```

### 12.2 Society Dashboard Stats View

```sql
CREATE VIEW public.society_dashboard_stats AS
SELECT 
  s.id as society_id,
  s.name as society_name,
  s.total_flats,
  
  -- Resident stats
  COUNT(DISTINCT up.id) FILTER (WHERE up.role IN ('resident', 'committee_member', 'secretary', 'treasurer', 'president') AND up.is_active = true) as total_residents,
  COUNT(DISTINCT up.id) FILTER (WHERE up.is_verified = true) as verified_residents,
  COUNT(DISTINCT up.id) FILTER (WHERE up.is_verified = false) as pending_verifications,
  
  -- Visitor stats (current month)
  COUNT(DISTINCT v.id) FILTER (WHERE v.visit_date >= date_trunc('month', CURRENT_DATE)) as visitors_this_month,
  COUNT(DISTINCT v.id) FILTER (WHERE v.visit_date = CURRENT_DATE) as visitors_today,
  COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'pending') as pending_visitor_approvals,
  
  -- Maintenance stats
  COUNT(DISTINCT mr.id) FILTER (WHERE mr.status IN ('submitted', 'reviewed', 'approved')) as pending_maintenance_requests,
  COUNT(DISTINCT mr.id) FILTER (WHERE mr.status = 'in_progress') as active_maintenance_requests,
  COUNT(DISTINCT mr.id) FILTER (WHERE mr.created_at >= date_trunc('month', CURRENT_DATE)) as maintenance_requests_this_month,
  
  -- Billing stats (current month)
  COUNT(DISTINCT mb.id) FILTER (WHERE mb.billing_month = date_trunc('month', CURRENT_DATE)) as bills_this_month,
  COUNT(DISTINCT mb.id) FILTER (WHERE mb.status IN ('generated', 'sent') AND mb.due_date >= CURRENT_DATE) as pending_payments,
  COUNT(DISTINCT mb.id) FILTER (WHERE mb.status IN ('generated', 'sent') AND mb.due_date < CURRENT_DATE) as overdue_payments,
  SUM(mb.total_amount) FILTER (WHERE mb.billing_month = date_trunc('month', CURRENT_DATE) AND mb.status = 'paid') as collections_this_month,
  
  -- Community stats
  COUNT(DISTINCT cp.id) FILTER (WHERE cp.created_at >= date_trunc('month', CURRENT_DATE)) as posts_this_month,
  COUNT(DISTINCT n.id) FILTER (WHERE n.is_active = true AND n.priority IN ('high', 'urgent')) as active_urgent_notices

FROM public.societies s
LEFT JOIN public.user_profiles up ON s.id = up.society_id
LEFT JOIN public.visitors v ON s.id = v.society_id
LEFT JOIN public.maintenance_requests mr ON s.id = mr.society_id
LEFT JOIN public.maintenance_bills mb ON s.id = mb.society_id
LEFT JOIN public.community_posts cp ON s.id = cp.society_id
LEFT JOIN public.notices n ON s.id = n.society_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.total_flats;
```

### 12.3 Monthly Financial Summary View

```sql
CREATE VIEW public.monthly_financial_summary AS
SELECT 
  s.id as society_id,
  s.name as society_name,
  mb.billing_month,
  
  -- Income (Maintenance Bills)
  COUNT(mb.id) as total_bills,
  COUNT(mb.id) FILTER (WHERE mb.status = 'paid') as paid_bills,
  COUNT(mb.id) FILTER (WHERE mb.status IN ('generated', 'sent')) as pending_bills,
  COUNT(mb.id) FILTER (WHERE mb.status IN ('generated', 'sent') AND mb.due_date < CURRENT_DATE) as overdue_bills,
  
  SUM(mb.total_amount) as total_billed_amount,
  SUM(mb.total_amount) FILTER (WHERE mb.status = 'paid') as total_collected_amount,
  SUM(mb.total_amount) FILTER (WHERE mb.status IN ('generated', 'sent')) as total_pending_amount,
  SUM(mb.total_amount) FILTER (WHERE mb.status IN ('generated', 'sent') AND mb.due_date < CURRENT_DATE) as total_overdue_amount,
  
  -- Collection percentage
  CASE 
    WHEN SUM(mb.total_amount) > 0 THEN 
      ROUND((SUM(mb.total_amount) FILTER (WHERE mb.status = 'paid') / SUM(mb.total_amount) * 100)::numeric, 2)
    ELSE 0 
  END as collection_percentage,
  
  -- Expenses
  COALESCE(SUM(se.total_amount) FILTER (WHERE se.payment_status = 'paid'), 0) as total_expenses,
  
  -- Net Position
  COALESCE(SUM(mb.total_amount) FILTER (WHERE mb.status = 'paid'), 0) - 
  COALESCE(SUM(se.total_amount) FILTER (WHERE se.payment_status = 'paid'), 0) as net_position

FROM public.societies s
LEFT JOIN public.maintenance_bills mb ON s.id = mb.society_id
LEFT JOIN public.society_expenses se ON s.id = se.society_id AND date_trunc('month', se.created_at) = mb.billing_month
WHERE s.is_active = true
GROUP BY s.id, s.name, mb.billing_month
ORDER BY s.name, mb.billing_month DESC;
```

## 13. Row Level Security (RLS) Policies

### 13.1 Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_request_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
```

### 13.2 Helper Function for User Society ID

```sql
-- Function to get current user's society_id
CREATE OR REPLACE FUNCTION auth.user_society_id() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT society_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS user_role 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Function to check if user is committee member or admin
CREATE OR REPLACE FUNCTION auth.is_committee_or_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role IN ('committee_member', 'secretary', 'treasurer', 'president', 'admin') 
  FROM public.user_profiles 
  WHERE id = auth.uid();
$$;
```

### 13.3 Basic RLS Policies

```sql
-- Societies: Users can only see their own society
CREATE POLICY "Users can view their own society" ON public.societies
  FOR SELECT USING (id = auth.user_society_id());

-- User Profiles: Users can see profiles in their society
CREATE POLICY "Users can view profiles in their society" ON public.user_profiles
  FOR SELECT USING (society_id = auth.user_society_id());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Family Members: Users can manage their own family members
CREATE POLICY "Users can manage their family members" ON public.family_members
  FOR ALL USING (user_id = auth.uid());

-- Vehicles: Users can manage their own vehicles
CREATE POLICY "Users can manage their vehicles" ON public.vehicles
  FOR ALL USING (user_id = auth.uid());

-- Visitors: Users can see visitors for their society and manage their own
CREATE POLICY "Users can view society visitors" ON public.visitors
  FOR SELECT USING (society_id = auth.user_society_id());

CREATE POLICY "Users can manage their own visitors" ON public.visitors
  FOR ALL USING (host_user_id = auth.uid());

CREATE POLICY "Committee can manage all visitors" ON public.visitors
  FOR ALL USING (
    society_id = auth.user_society_id() AND 
    auth.is_committee_or_admin()
  );

-- Community Posts: Users can see posts in their society
CREATE POLICY "Users can view society posts" ON public.community_posts
  FOR SELECT USING (society_id = auth.user_society_id());

CREATE POLICY "Users can create posts in their society" ON public.community_posts
  FOR INSERT WITH CHECK (
    society_id = auth.user_society_id() AND 
    author_id = auth.uid()
  );

CREATE POLICY "Users can update their own posts" ON public.community_posts
  FOR UPDATE USING (author_id = auth.uid());

-- Post Comments: Users can see comments on society posts
CREATE POLICY "Users can view comments on society posts" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts 
      WHERE id = post_id AND society_id = auth.user_society_id()
    )
  );

CREATE POLICY "Users can create comments" ON public.post_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.community_posts 
      WHERE id = post_id AND society_id = auth.user_society_id()
    )
  );

-- Maintenance Requests: Users can see requests in their society
CREATE POLICY "Users can view society maintenance requests" ON public.maintenance_requests
  FOR SELECT USING (society_id = auth.user_society_id());

CREATE POLICY "Users can create their own maintenance requests" ON public.maintenance_requests
  FOR INSERT WITH CHECK (
    society_id = auth.user_society_id() AND 
    resident_id = auth.uid()
  );

CREATE POLICY "Users can update their own maintenance requests" ON public.maintenance_requests
  FOR UPDATE USING (resident_id = auth.uid());

-- Maintenance Bills: Users can see their own bills
CREATE POLICY "Users can view their own bills" ON public.maintenance_bills
  FOR SELECT USING (resident_id = auth.uid());

CREATE POLICY "Committee can view all society bills" ON public.maintenance_bills
  FOR SELECT USING (
    society_id = auth.user_society_id() AND 
    auth.is_committee_or_admin()
  );

-- Notices: Users can see notices for their society
CREATE POLICY "Users can view society notices" ON public.notices
  FOR SELECT USING (society_id = auth.user_society_id());

-- Notification Preferences: Users can manage their own preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());
```

## 14. Initial Data Setup

### 14.1 Create Default Notification Preferences Function

```sql
-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user profile is created
CREATE TRIGGER create_default_notification_preferences_trigger
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();
```

### 14.2 Sample Data Insertion (Optional)

```sql
-- Sample Society
INSERT INTO public.societies (
  name, code, address, city, state, pin_code, total_flats, 
  contact_email, contact_phone, maintenance_amount
) VALUES (
  'Green Valley Apartments',
  'GVA001',
  '123 Main Road, Koramangala',
  'Bangalore',
  'Karnataka',
  '560034',
  100,
  'admin@greenvalley.com',
  '+919876543210',
  3000.00
);

-- Sample amenities
INSERT INTO public.amenities (society_id, name, description, category, capacity, hourly_rate) 
VALUES 
(
  (SELECT id FROM public.societies WHERE code = 'GVA001'),
  'Swimming Pool',
  'Community swimming pool with lifeguard facility',
  'sports',
  20,
  100.00
),
(
  (SELECT id FROM public.societies WHERE code = 'GVA001'),
  'Club House',
  'Community hall for events and gatherings',
  'events',
  50,
  500.00
);
```

## 15. Performance Optimizations

### 15.1 Additional Indexes for Performance

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_visitors_society_date_status ON public.visitors(society_id, visit_date, status);
CREATE INDEX idx_maintenance_requests_society_status ON public.maintenance_requests(society_id, status);
CREATE INDEX idx_community_posts_society_created ON public.community_posts(society_id, created_at DESC);
CREATE INDEX idx_maintenance_bills_resident_status ON public.maintenance_bills(resident_id, status);
CREATE INDEX idx_notification_logs_user_category ON public.notification_logs(user_id, category);

-- Partial indexes for active records
CREATE INDEX idx_active_vendors ON public.vendors(category, rating DESC) WHERE is_active = true;
CREATE INDEX idx_active_amenities ON public.amenities(society_id) WHERE is_active = true;
CREATE INDEX idx_pending_approvals ON public.visitors(society_id, created_at DESC) WHERE status = 'pending';

-- Text search indexes (if full-text search is needed)
CREATE INDEX idx_community_posts_search ON public.community_posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_maintenance_requests_search ON public.maintenance_requests USING gin(to_tsvector('english', title || ' ' || description));
```

## 16. Cleanup and Maintenance

### 16.1 Data Cleanup Functions

```sql
-- Function to cleanup expired visitor QR codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_qr_codes()
RETURNS integer AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.visitors 
  SET qr_code_data = NULL, qr_code_url = NULL
  WHERE qr_code_expires_at < now() 
  AND qr_code_data IS NOT NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old notification logs
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications(days_to_keep integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  affected_rows integer;
BEGIN
  DELETE FROM public.notification_logs 
  WHERE created_at < now() - (days_to_keep || ' days')::interval
  AND status IN ('delivered', 'failed', 'read');
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;
```

---

## Schema Summary

This comprehensive schema includes:

1. **15+ Core Tables** covering all app features
2. **Custom Types (Enums)** for data consistency
3. **Comprehensive Indexing** for performance
4. **Row Level Security** for data protection
5. **Triggers and Functions** for automation
6. **Views** for common queries
7. **Data Validation** with constraints
8. **Audit Trail** with timestamps
9. **Performance Optimizations**
10. **Maintenance Functions**

The schema is designed to scale from small societies (50 units) to larger ones (500+ units) while maintaining performance and data integrity. It supports all the features implemented in your Aptly React Native app and provides room for future enhancements.