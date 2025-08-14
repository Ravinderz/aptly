# Aptly Admin System - Complete Design Specification

## 📋 Overview

Multi-tier role-based admin system for housing society management with democratic governance features and comprehensive audit trails.

---

## 🎯 Admin Role Hierarchy

### **1. SUPER ADMIN** 👑
- **Scope**: Platform-wide (All societies)
- **Primary Users**: Aptly team members
- **Key Functions**:
  - Society onboarding & activation
  - Platform analytics & monitoring  
  - Emergency intervention capabilities
  - Global admin management

### **2. COMMUNITY MANAGER (CM)** 🏠
- **Scope**: Single society (Full control)
- **Primary Users**: Society Secretary, Management Committee Chairman
- **Key Functions**:
  - Complete society management
  - Sub-admin role assignment
  - Emergency response coordination
  - Resident management & approvals
  - **Retains all permissions** even when delegating to sub-admins

### **3. SUB-ADMINS** 👥
#### **Financial Manager** 💰
- **Scope**: Multi-society capable
- **Functions**: Billing, payments, GST compliance, financial reports

#### **Security Admin** 🔒  
- **Scope**: Multi-society capable
- **Functions**: Visitor management, security incidents, access control

#### **Maintenance Admin** 🔧
- **Scope**: Multi-society capable
- **Functions**: Maintenance requests, vendor management, asset tracking

---

## 🔐 Permission Matrix

### **Access Control Logic**
```typescript
interface Permission {
  role: AdminRole;
  resource: string;
  actions: string[];
  scope: 'global' | 'single_society' | 'multi_society';
  escalation_to?: AdminRole;
}

// Examples:
{
  role: 'financial_manager',
  resource: 'billing_dispute',
  actions: ['read', 'comment', 'initial_resolution'],
  scope: 'multi_society',
  escalation_to: 'community_manager' // CM handles final resolution
}
```

### **Escalation Matrix**
```
Financial/Security/Maintenance Issue
    ↓
Sub-Admin (First Response)
    ↓ (If dispute/complex issue)
Community Manager (Final Authority)
    ↓ (If emergency/technical issue)
Super Admin (Platform Intervention)
```

---

## 📱 Multi-Society Dashboard Design

### **Society Selector for Sub-Admins**
```jsx
<SocietySelector>
  <CurrentSociety priority="high">
    <Society name="Greenwood Apts" notifications={5} />
  </CurrentSociety>
  
  <OtherSocieties priority="emergency_only">
    <Society name="Marina Bay" notifications={1} type="emergency" />
    <Society name="Sunrise Heights" notifications={0} />
  </OtherSocieties>
</SocietySelector>
```

### **Notification Priority System**
```typescript
interface NotificationPriority {
  selected_society: {
    all_notifications: true,
    real_time: true,
    priority: 1
  },
  other_societies: {
    emergency_only: true,
    assigned_tasks_only: true,
    priority: 2,
    batch_delivery: true
  }
}
```

---

## 🗳️ Democratic Governance Features

### **Anonymous Voting System**
```typescript
interface VotingProcess {
  type: 'role_promotion' | 'policy_change' | 'budget_approval';
  nomination_period: 7; // days
  voting_period: 7; // days
  quorum_required: 30; // percentage of residents
  winning_threshold: 'simple_majority' | 'two_thirds';
  anonymity: 'fully_anonymous';
  transparency: 'results_only'; // Who won, not who voted how
  
  restrictions: {
    community_manager: 'appointment_only'; // Too critical for voting
    max_simultaneous_votes: 2;
    cooling_period_months: 6;
  }
}
```

### **CM Succession Protocol**
```typescript
interface CMSuccession {
  triggers: [
    'cm_resignation',
    'cm_inactive_30_days',
    'resident_no_confidence_vote',
    'super_admin_intervention'
  ];
  
  process: {
    step1: 'cm_can_designate_successor',
    step2: 'if_no_successor_then_voting',
    step3: 'super_admin_can_override_for_emergency',
    interim_management: 'senior_sub_admin_or_super_admin'
  }
}
```

---

## 📊 Comprehensive Audit System

### **Audit Log Structure**
```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  category: 'admin_actions' | 'billing_finance' | 'maintenance_management' | 
           'security_management' | 'resident_management' | 'communication';
  event_type: string;
  actor: {
    user_id: string;
    role: AdminRole;
    society_id: string;
  };
  target: {
    resource_type: string;
    resource_id: string;
    affected_users?: string[];
  };
  details: {
    old_value?: any;
    new_value?: any;
    reason?: string;
    ip_address: string;
    device: 'mobile' | 'web';
    session_id: string;
  };
  retention_period: 365; // days (1 year)
}
```

### **Audit Categories & Events**

#### **Administrative Actions**
- Role assignments/revocations
- Policy changes
- Emergency declarations
- System configuration updates

#### **Financial Operations**  
- Bill generation/modification
- Payment processing
- Financial report generation
- GST compliance activities

#### **Maintenance Workflows**
- Request lifecycle tracking
- Vendor assignments
- Cost approvals
- Work completion verification

#### **Security Management**
- Visitor approvals/rejections
- Incident reporting
- Access control changes
- Emergency responses

#### **Resident Management**
- Resident additions/verifications
- Flat transfers
- Voting processes
- Promotion workflows

---

## 🚨 Emergency Management System

### **Emergency Response Chain**
```typescript
interface EmergencyProtocol {
  incident_levels: {
    low: 'routine_security_issue',
    medium: 'maintenance_emergency', 
    high: 'safety_threat',
    critical: 'life_threatening_situation'
  };
  
  response_chain: {
    primary: 'community_manager',
    escalation_time: 15, // minutes
    secondary: 'super_admin',
    notify_all: 'sub_admins_of_society'
  };
  
  capabilities: {
    mass_notification: 'sms_push_email',
    emergency_broadcast: 'all_residents_immediately',
    authority_integration: 'future_enhancement', // Police/Fire/Medical
    override_access: 'super_admin_can_take_control'
  }
}
```

---

## 🎨 Admin UI/UX Specifications

### **Role-Based Navigation Menus**

#### **Super Admin**
```jsx
<Navigation>
  <Section title="Platform Overview">
    <Item>Dashboard</Item>
    <Item>Society Management</Item>
    <Item>User Management</Item>
    <Item>Platform Analytics</Item>
  </Section>
  <Section title="Support">
    <Item>Emergency Console</Item>
    <Item>Technical Support</Item>
    <Item>System Monitoring</Item>
  </Section>
</Navigation>
```

#### **Community Manager**
```jsx
<Navigation>
  <Section title="Society Management">
    <Item>Dashboard</Item>
    <Item>Residents</Item>
    <Item>Team Management</Item>
  </Section>
  <Section title="Operations">
    <Item>Billing</Item>
    <Item>Maintenance</Item>
    <Item>Visitors</Item>
    <Item>Communication</Item>
  </Section>
  <Section title="Governance">
    <Item>Voting</Item>
    <Item>Policies</Item>
    <Item>Analytics</Item>
  </Section>
</Navigation>
```

#### **Sub-Admin (Example: Financial Manager)**
```jsx
<Navigation>
  <Section title="Society Selector">
    <SocietySelector />
  </Section>
  <Section title="Financial Operations">
    <Item>Dashboard</Item>
    <Item>Billing</Item>
    <Item>Payments</Item>
    <Item>Reports</Item>
  </Section>
  <Section title="Compliance">
    <Item>GST Management</Item>
    <Item>Audit Reports</Item>
  </Section>
</Navigation>
```

### **Permission-Based Component Rendering**
```jsx
// Components automatically adapt based on user permissions
const BillingCard = ({ bill }) => (
  <Card>
    <BillDetails bill={bill} />
    
    {hasPermission('billing.update') && 
      <EditButton />
    }
    
    {hasPermission('billing.delete') && 
      <DeleteButton />
    }
    
    {hasPermission('billing.approve') && hasEscalation() &&
      <EscalateToCMButton />
    }
    
    {userRole === 'community_manager' && 
      <FinalApprovalSection />
    }
  </Card>
);
```

---

## 🔄 Data Flow Architecture

### **Multi-Society Data Management**
```typescript
interface AdminSession {
  user: AdminUser;
  active_society: Society;
  accessible_societies: Society[];
  permissions: Permission[];
  notification_preferences: NotificationConfig;
}

// When sub-admin switches society
const switchSociety = (societyId: string) => {
  // Update session
  session.active_society = societies.find(s => s.id === societyId);
  
  // Refresh permissions for new society
  session.permissions = getPermissionsForSociety(user.role, societyId);
  
  // Update dashboard data
  dashboard.refresh(societyId);
  
  // Update notification channels
  notifications.updateFilters(societyId);
};
```

### **Audit Log Processing**
```typescript
const logAdminAction = (action: AdminAction) => {
  const log: AuditLog = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    category: categorizeAction(action.type),
    event_type: action.type,
    actor: {
      user_id: session.user.id,
      role: session.user.role,
      society_id: session.active_society.id
    },
    target: {
      resource_type: action.resource.type,
      resource_id: action.resource.id,
      affected_users: action.affected_users
    },
    details: {
      old_value: action.old_state,
      new_value: action.new_state,
      reason: action.reason,
      ip_address: session.ip_address,
      device: session.device,
      session_id: session.id
    },
    retention_period: 365
  };
  
  // Store in audit database
  auditDatabase.insert(log);
  
  // Real-time notification to relevant admins
  if (requiresNotification(action.type)) {
    notifyRelevantAdmins(log);
  }
};
```

---

## 📅 Implementation Phases

### **Phase 6: Admin Foundation (Week 8-9)**
- Super Admin platform setup
- Community Manager basic functions
- Role assignment system
- Basic audit logging

### **Phase 7: Sub-Admin System (Week 10-11)**  
- Multi-society dashboard
- Financial Manager features
- Security Admin features
- Permission-based UI components

### **Phase 8: Democratic Features (Week 12-13)**
- Anonymous voting system
- CM succession protocols
- Resident promotion workflows
- Emergency management system

### **Phase 9: Advanced Features (Week 14-15)**
- Comprehensive audit reporting
- Advanced analytics
- Notification management
- Performance optimization

---

## 🎯 Success Metrics

### **Admin Efficiency**
- Time to resolve maintenance requests: Target <24 hours
- Bill generation time: Target <2 hours for 100+ flats
- Visitor approval rate: Target >90% within 30 minutes

### **System Adoption**
- Admin task completion via app: Target >80%
- Multi-society admin satisfaction: Target >4.5/5
- Emergency response time: Target <10 minutes

### **Democratic Engagement**
- Voting participation rate: Target >40% of residents
- Admin promotion via voting: Target 30% of appointments
- Policy change proposals: Target 2+ per quarter per society

---

This comprehensive admin system balances operational efficiency with democratic governance, providing scalability from small societies to large complexes while maintaining security and accountability.