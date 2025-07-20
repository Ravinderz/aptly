# Aptly Mobile App PRD: Implementation Plan for Backend Integration

## Executive Summary

This Product Requirements Document outlines the systematic implementation of the Aptly Housing Society Management mobile app features, leveraging the completed backend infrastructure. With 70% of backend services already implemented, this PRD focuses on building the mobile app's Services Tab and Profile Tab to create a complete society management solution.

**Key Focus Areas:**
- Integration with existing backend APIs (30+ endpoints ready)
- Services Tab implementation (Maintenance, Billing, Amenities)
- Profile Tab development (User Management, Society Dashboard)
- Authentication flow with Indian phone validation
- File upload system with offline capabilities

## Current State Analysis

### ✅ Backend Infrastructure (Completed)

**Authentication System:**
- Indian phone number validation (+91 prefix)
- OTP verification via Supabase Auth
- JWT token management with refresh
- Role-based access control (6 user roles)
- Society association workflow

**Core Services APIs:**
- **Maintenance System:** 30+ endpoints with file upload support
- **Billing System:** GST-compliant with PDF generation
- **Society Management:** User verification and role management
- **Database:** 14 tables with RLS policies

**Available Endpoints:**
```bash
# Authentication (6 endpoints)
POST /api/v4/auth/register-phone
POST /api/v4/auth/verify-otp
GET  /api/v4/auth/me

# Maintenance (10 endpoints)
POST /api/v4/services/maintenance
GET  /api/v4/services/maintenance
GET  /api/v4/services/maintenance/analytics

# Billing (9 endpoints)
GET  /api/v4/services/billing/bills
GET  /api/v4/services/billing/bills/:id/pdf
POST /api/v4/services/billing/calculate-gst

# Society (6 endpoints)
GET  /api/v4/societies/search
GET  /api/v4/societies/:id/residents
```

### 🚧 Mobile App Status

**Completed Features:**
- Visitor Management System (Home Tab)
- Basic navigation structure
- Design system implementation

**Pending Implementation:**
- Services Tab (complete feature set)
- Profile Tab (user account management)
- Authentication integration
- File upload functionality
- Push notifications

## Implementation Roadmap

### Phase 1: Authentication & Core Setup (Week 1)
**Priority: CRITICAL**

#### Week 1 Tasks:
1. **Authentication Flow Implementation**
   - Phone registration screen with Indian number validation
   - OTP verification interface
   - Society code entry and verification
   - Role selection and profile setup
   - Biometric authentication setup

2. **API Integration Foundation**
   - Axios service layer with interceptors
   - Authentication token management
   - Error handling and retry logic
   - Network state management

3. **Secure Storage Setup**
   - AsyncStorage for user data
   - Keychain/Keystore for sensitive tokens
   - Biometric authentication configuration

**Technical Implementation:**
```typescript
// Authentication Service
interface AuthService {
  registerPhone(phone: string, societyCode: string): Promise<AuthResult>
  verifyOTP(phone: string, otp: string): Promise<AuthResult>
  associateWithSociety(userId: string, societyId: string, flatNumber: string): Promise<void>
  refreshToken(): Promise<TokenPair>
  logout(): Promise<void>
}

// API Service Layer
interface APIService {
  setAuthToken(token: string): void
  makeRequest<T>(config: AxiosRequestConfig): Promise<T>
  uploadFile(file: File, endpoint: string): Promise<UploadResult>
}
```

### Phase 2: Services Tab Implementation (Weeks 2-3)
**Priority: HIGH**

#### Week 2: Maintenance Request System

**2.1 Maintenance Request Creation**
- Category selection with India-specific categories (Electrical, Plumbing, Civil, Lift, Generator, Water Tank, etc.)
- Photo capture/gallery selection (max 5 images) with compression
- Voice note recording using expo-av (max 2 minutes) for language barrier support
- Priority selection with visual indicators using color system
- Location tagging (Flat/Common Area/Specific Location)
- Description with voice-to-text support in Hindi/English

**UI Design Implementation:**
```typescript
// Maintenance Request Form Design
interface MaintenanceFormDesign {
  container: {
    backgroundColor: '#FAFAFA',
    padding: 16,
    spacing: 24
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderColor: '#E0E0E0',
    selectedBorderColor: '#FF6B35'
  },
  priorityIndicator: {
    low: '#4CAF50',      // India Green
    medium: '#FF9800',   // Warning Amber  
    high: '#FF6B35',     // Primary Saffron
    emergency: '#D32F2F' // Error Red
  },
  photoUpload: {
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderColor: '#FF6B35',
    borderRadius: 8,
    padding: 32
  }
}
```

**2.2 Request Tracking & Management**
- Real-time status updates using Supabase subscriptions with Indian cultural context
- Timeline view with Hindi/English labels
- Push notifications with culturally appropriate messaging
- Vendor assignment tracking with local vendor information
- Cost estimation display in INR with GST breakdown
- Completion rating with 5-star system and feedback in preferred language

**Technical Features:**
```typescript
interface MaintenanceRequest {
  category: MaintenanceCategory
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  location: string
  photos: string[]
  voiceNote?: string
  flatId: string
  residentId: string
}

// File Upload Configuration
const uploadConfig = {
  maxFiles: 5,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'audio/mp4'],
  compressionQuality: 0.8
}
```

#### Week 3: Billing System Integration

**3.1 Bill Viewing & Management**
- GST-compliant bill display with Indian tax format
- Multi-line item breakdown using card-based design
- Payment history with culturally appropriate icons
- Due date notifications with festival consideration
- Arrears tracking with respectful messaging

**Billing UI Design:**
```typescript
// Bill Display Design
interface BillDisplayDesign {
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeft: '4px solid #FF6B35'
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: 'Inter'
  },
  gstBreakdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  statusIndicator: {
    paid: '#4CAF50',     // India Green
    pending: '#FF9800',  // Warning Amber
    overdue: '#D32F2F'   // Error Red
  }
}
```

**3.2 Payment Integration Preparation**
- Payment gateway UI with UPI-first design
- Receipt generation with QR codes
- Payment status tracking with Indian payment methods
- Offline payment queue with cultural considerations

**UI Components:**
```typescript
interface BillDisplayProps {
  bill: MaintenanceBill
  onPayment: (billId: string) => void
  onDownloadPDF: (billId: string) => void
}

interface PaymentHistoryProps {
  payments: Payment[]
  onReceiptDownload: (paymentId: string) => void
}
```

### Phase 3: Profile Tab & Advanced Features (Week 4)
**Priority: MEDIUM**

#### Week 4: Profile Management

**4.1 Personal Information Management**
- Comprehensive profile form with Indian family structure considerations
- Emergency contact management with relationship hierarchy
- Vehicle registration with Indian vehicle types (2-wheeler, 4-wheeler)
- Document vault for Indian documents (Aadhar, PAN, Lease, NOC)
- Profile photo upload with compression and cultural sensitivity

**Profile UI Design:**
```typescript
// Profile Screen Design
interface ProfileDesign {
  headerCard: {
    backgroundColor: '#FF6B35', // Primary Saffron
    borderRadius: 16,
    padding: 24,
    marginBottom: 16
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderColor: '#E0E0E0'
  },
  indianDocumentIcons: {
    aadhar: 'card-id',
    pan: 'file-text',
    lease: 'home',
    noc: 'shield-check'
  }
}
```

**4.2 Society Integration Features**
- Flat ownership tracking with Indian property ownership patterns
- Committee participation with Indian society hierarchy
- Payment history formatted for Indian tax purposes
- Society directory with Indian privacy preferences

**4.3 Notification Management**
- Category-based preferences with Indian cultural context
- Do Not Disturb with festival and prayer time consideration
- Notification history in preferred language
- Emergency override respecting cultural sensitivities

### Phase 4: Polish & Optimization (Week 5)
**Priority: LOW**

#### Week 5: Performance & UX

**5.1 Offline Functionality**
- Offline queue for maintenance requests
- Cached data for essential features
- Sync management when connection restored
- Background sync for file uploads

**5.2 Push Notifications**
- Firebase Cloud Messaging integration
- Category-based notification routing
- Silent notifications for data sync
- Rich notifications with actions

**5.3 Performance Optimization**
- Image compression and caching
- Lazy loading for large lists
- Background task management
- Memory usage optimization

## Feature Specifications

### Services Tab: Complete Feature Set

#### 1. Maintenance Request System

**Core Functionality:**
- **Digital Complaint Registration** with photo upload and voice notes
- **Category Selection** tailored for Indian housing societies
- **Priority-based Tracking** with automatic escalation
- **Real-time Status Updates** with push notifications
- **Vendor Assignment Tracking** with cost estimates
- **Completion Rating** and feedback system

**Indian-Specific Features:**
- Voice notes for language barrier mitigation
- Festival/weather considerations for scheduling
- Local vendor database integration
- Hindi/regional language support

**User Flow:**
```
1. Services Tab → Maintenance Requests → Create New
2. Select Category → Add Photos/Voice → Set Priority
3. Submit Request → Real-time Tracking → Rate Experience
```

#### 2. Billing System

**GST-Compliant Features:**
- **Automated Bill Display** with GST calculations
- **Multi-line Item Breakdown** for transparency
- **Digital Receipt Access** with QR verification
- **Payment Gateway Integration** (UPI, Cards, Net Banking)
- **Arrears Management** with automated reminders

**Committee Features:**
- Financial transparency with real-time expense tracking
- Audit trail for all transactions
- Budget variance reporting

### Profile Tab: User Management

#### 1. Personal Profile Management

**Core Features:**
- **Family Member Registry** with age verification
- **Emergency Contact Management** with relationships
- **Vehicle Registration** with parking assignments
- **Document Vault** for important papers
- **Society Integration** with flat ownership tracking

#### 2. Notification Preferences

**Granular Controls:**
- Category-specific notification settings
- Channel preferences (Push, Email, WhatsApp)
- Do Not Disturb hours configuration
- Emergency override settings

**Notification Categories:**
```typescript
enum NotificationCategory {
  MAINTENANCE = 'maintenance',
  BILLING = 'billing',
  EVENTS = 'events',
  SECURITY = 'security',
  COMMITTEE = 'committee',
  VISITORS = 'visitors',
  AMENITIES = 'amenities',
  EMERGENCY = 'emergency'
}
```

## Design System (India-Focused)

### Color Palette System

**Primary Colors (Trust & Heritage):**
- **Primary Saffron:** #FF6B35 - Main brand color representing courage and sacrifice from Indian heritage
- **Primary Saffron Light:** #FF8A65 - Interactive states and highlights  
- **Primary Saffron Dark:** #E65100 - Headers and emphasis elements

**Secondary Colors (Prosperity & Growth):**
- **India Green:** #4CAF50 - Success indicators, positive actions (representing faith and prosperity)
- **Warning Amber:** #FF9800 - Cautionary messages, pending status
- **Error Red:** #D32F2F - Critical issues, failed actions

**Neutral Colors (Professional Foundation):**
- **Background:** #FAFAFA - Primary app background
- **Surface:** #FFFFFF - Card backgrounds and content areas  
- **Text Primary:** #212121 - Main content text
- **Text Secondary:** #757575 - Supporting text and captions
- **Divider:** #E0E0E0 - Separators and borders

**Cultural Significance:**
Saffron represents courage, sacrifice, and spirituality in Indian culture, commonly used in religious ceremonies and the national flag. Green represents life, happiness, and prosperity, associated with nature and growth.

### Typography System

**Font Family:** Inter (Primary) / Noto Sans (Hindi/Regional Language Support)

**Type Scale (Mobile-Optimized for India):**
- **Display Large:** 32pt - Society names, main headings  
- **Display Medium:** 28pt - Section headings
- **Display Small:** 24pt - Card titles, important labels
- **Headline Large:** 20pt - Form section headers
- **Headline Medium:** 18pt - List item titles  
- **Body Large:** 16pt - Primary content, form inputs
- **Body Medium:** 14pt - Secondary text, captions
- **Label Large:** 12pt - Button text, small labels

**Multilingual Support:**
- Primary language: English
- Secondary support: Hindi (Devanagari script)
- Regional language hooks for future expansion (Tamil, Telugu, Gujarati, Bengali)

### Spacing System

**8pt Grid System:**
- Base unit: 8pt for consistent spacing
- Common values: 8, 16, 24, 32, 40, 48, 64pt
- Card padding: 16-24pt internal spacing
- Form field spacing: 24pt between fields
- Section spacing: 32-48pt between major sections

### Component Design Specifications

**Button Components:**
```typescript
interface ButtonVariants {
  primary: {
    backgroundColor: '#FF6B35', // Primary Saffron
    color: '#FFFFFF',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 16
  },
  secondary: {
    backgroundColor: 'transparent',
    color: '#FF6B35',
    border: '2px solid #FF6B35',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 16
  },
  success: {
    backgroundColor: '#4CAF50', // India Green
    color: '#FFFFFF',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 16
  }
}
```

**Card Components:**
```typescript
interface CardDesign {
  background: '#FFFFFF',
  borderRadius: 12,
  shadow: 'elevation-2',
  padding: 16,
  margin: 8,
  border: '1px solid #E0E0E0'
}
```

**Input Components:**
```typescript
interface InputDesign {
  backgroundColor: '#FFFFFF',
  borderColor: '#E0E0E0',
  focusBorderColor: '#FF6B35',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 16,
  placeholderColor: '#757575'
}
```

## Technical Implementation Details

### Technology Stack

**Mobile Framework:**
- Expo SDK 53+ with managed workflow
- React Native with TypeScript
- **Lucide React Native** for consistent iconography
- **NativeWindCSS** for utility-first styling
- React Navigation 6+ for navigation

**Backend Integration:**
- Axios for API communication
- Supabase client for real-time subscriptions
- AsyncStorage for local data persistence
- Expo SecureStore for sensitive data

**Media & Files:**
- Expo ImagePicker for photo selection
- Expo AV for voice recording
- Expo FileSystem for file management
- Expo MediaLibrary for gallery access

**Notifications:**
- Expo Notifications for local notifications
- Firebase Cloud Messaging for push notifications
- Background fetch for silent updates

### India-Specific Integrations
- **UPI Payment Gateway** integration (Razorpay/PayU)
- **GST calculation engine** for maintenance billing
- **WhatsApp Business API** for communication (future enhancement)

### API Integration Architecture

```typescript
// Service Layer Structure
interface ServiceLayer {
  auth: AuthService
  maintenance: MaintenanceService
  billing: BillingService
  profile: ProfileService
  notifications: NotificationService
}

// Error Handling
interface APIError {
  code: string
  message: string
  statusCode: number
  retryable: boolean
}

// Offline Queue
interface OfflineQueue {
  addRequest(request: QueuedRequest): void
  processQueue(): Promise<void>
  clearQueue(): void
  getQueueStatus(): QueueStatus
}
```

### File Upload System

**Implementation Strategy:**
```typescript
interface FileUploadConfig {
  maxFiles: number
  maxFileSize: number
  allowedTypes: string[]
  compressionQuality: number
  uploadEndpoint: string
}

interface UploadProgress {
  fileId: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}
```

**Features:**
- Progress indicators for uploads
- Automatic retry for failed uploads
- Background upload capability
- File compression before upload
- Offline queue with sync when online

### Security Implementation

**Data Protection:**
- End-to-end encryption for sensitive data
- Biometric authentication for app access
- Secure token storage in Keychain/Keystore
- Certificate pinning for API calls
- Input validation and sanitization

**Privacy Compliance:**
- GDPR-compliant data handling
- User consent management
- Data retention policies
- Secure data deletion

## Success Metrics & KPIs

### User Adoption Metrics
- **Registration Completion Rate:** >85%
- **Daily Active Users:** >60% of registered residents
- **Feature Adoption:** >70% using maintenance requests digitally
- **Session Duration:** >5 minutes average per session

### Technical Performance Metrics
- **App Load Time:** <3 seconds cold start
- **API Response Time:** <2 seconds for critical operations
- **Crash Rate:** <1% of all sessions
- **File Upload Success Rate:** >95%

### Business Impact Metrics
- **Digital Payment Adoption:** >80% of bills paid through app
- **Maintenance Response Time:** <4 hours average
- **User Satisfaction:** >4.5/5 app store rating
- **Support Ticket Reduction:** >50% decrease

## Implementation Todo List

### Phase 1: Foundation (Week 1)
- [ ] Set up authentication screens and flow
- [ ] Implement phone registration with OTP verification
- [ ] Create society association workflow
- [ ] Set up secure token storage and biometric auth
- [ ] Build API service layer with error handling
- [ ] Implement role-based navigation
- [ ] Add network state management
- [ ] Create loading and error states for all screens

### Phase 2: Services Tab (Weeks 2-3)
- [ ] **Maintenance Request System:**
  - [ ] Create maintenance request form with categories
  - [ ] Implement photo capture and gallery selection
  - [ ] Add voice note recording functionality
  - [ ] Build priority and location selection
  - [ ] Create real-time status tracking
  - [ ] Implement request history and filtering
  - [ ] Add vendor assignment display
  - [ ] Build rating and feedback system

- [ ] **Billing System:**
  - [ ] Create bill listing with GST breakdown
  - [ ] Implement bill detail view with PDF download
  - [ ] Add payment history display
  - [ ] Build due date notifications
  - [ ] Create arrears tracking
  - [ ] Implement payment gateway UI preparation

### Phase 3: Profile Tab (Week 4)
- [ ] **Profile Management:**
  - [ ] Build comprehensive profile form
  - [ ] Implement family member management
  - [ ] Add vehicle registration
  - [ ] Create document vault with upload
  - [ ] Build emergency contact management

- [ ] **Notification System:**
  - [ ] Create notification preferences screen
  - [ ] Implement category-based controls
  - [ ] Add Do Not Disturb configuration
  - [ ] Build notification history
  - [ ] Create emergency override settings

### Phase 4: Advanced Features (Week 5)
- [ ] **Offline Functionality:**
  - [ ] Implement offline queue for requests
  - [ ] Add cached data management
  - [ ] Create sync indicators and status
  - [ ] Build background sync process

- [ ] **Push Notifications:**
  - [ ] Set up Firebase Cloud Messaging
  - [ ] Implement notification routing
  - [ ] Add rich notification actions
  - [ ] Create silent notification handling

- [ ] **Performance Optimization:**
  - [ ] Implement image compression and caching
  - [ ] Add lazy loading for lists
  - [ ] Optimize memory usage
  - [ ] Implement background task management

### Phase 5: Testing & Deployment (Week 6)
- [ ] **Testing:**
  - [ ] Unit tests for all services
  - [ ] Integration tests for API calls
  - [ ] E2E tests for critical user flows
  - [ ] Performance testing and optimization

- [ ] **Deployment Preparation:**
  - [ ] Configure app store metadata
  - [ ] Set up crash reporting and analytics
  - [ ] Prepare release notes and documentation
  - [ ] Create user onboarding flow

## Risk Mitigation

### Technical Risks
1. **API Integration Issues:** Comprehensive error handling and fallback mechanisms
2. **File Upload Failures:** Retry logic and offline queue implementation
3. **Performance Issues:** Progressive loading and image optimization
4. **Authentication Problems:** Multiple auth methods and secure storage

### User Experience Risks
1. **Complex Onboarding:** Step-by-step guided setup with help tooltips
2. **Feature Discovery:** Progressive disclosure and contextual help
3. **Offline Usage:** Clear offline indicators and queue status
4. **Error Handling:** User-friendly error messages with recovery options

## Conclusion

This PRD provides a systematic approach to implementing the Aptly mobile app features, leveraging the robust backend infrastructure already in place. The phased implementation ensures rapid delivery of core functionality while maintaining high quality and user experience standards.

**Key Success Factors:**
- Leverage existing backend APIs for faster development
- Focus on Indian market-specific features and UX patterns
- Implement offline-first approach for reliability
- Maintain security and privacy compliance
- Create intuitive user flows that reduce learning curve

The implementation timeline of 6 weeks provides a realistic roadmap for delivering a production-ready mobile app that transforms how Indian housing societies manage their operations and engage with residents.