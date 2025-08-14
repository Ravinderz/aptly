# Aptly App - Comprehensive REST API Endpoint Analysis

## Overview
This document provides a complete analysis of required REST API endpoints for Manager, Admin, Security persona screens, and Resident Profile/Settings screens in the Aptly React Native Expo app, based on comprehensive screen analysis and existing V4 backend integration patterns.

**Base URL**: `https://api.aptly.app/v4` (localhost:3000 for development)

---

## 🏢 Manager Persona Endpoints

### Manager Dashboard
**Screen**: `/app/manager/dashboard.tsx`

#### 1. Manager Dashboard Data
**Endpoint**: `GET /manager/dashboard`
**Authentication**: Required (Bearer Token + Manager Role)

```json
Response:
{
  "success": true,
  "data": {
    "metrics": {
      "assignedSocieties": 3,
      "totalResidents": 450,
      "activeTickets": 12,
      "resolvedTickets": 89,
      "averageResponseTime": 2.5,
      "satisfactionScore": 94,
      "monthlyTargets": {
        "responseTime": 4,
        "resolutionRate": 90,
        "satisfactionTarget": 92
      }
    },
    "assignedSocieties": [
      {
        "id": "society_1",
        "name": "Green Valley Society",
        "totalUnits": 150,
        "occupiedUnits": 142,
        "activeIssues": 3,
        "lastActivity": "2 hours ago",
        "healthScore": 85,
        "status": "healthy",
        "healthBreakdown": {
          "engagement": 92,
          "issueManagement": 87,
          "financial": 94,
          "communication": 78,
          "maintenance": 82,
          "satisfaction": 88
        },
        "recommendations": [
          "Improve communication response time",
          "Address maintenance backlog"
        ],
        "trends": {
          "direction": "improving",
          "changePercentage": 5,
          "period": "last_month"
        }
      }
    ]
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

#### 2. Manager Society Assignment
**Endpoint**: `GET /manager/societies`
**Authentication**: Required (Bearer Token + Manager Role)

#### 3. Society Health Scoring
**Endpoint**: `GET /manager/societies/:societyId/health`
**Authentication**: Required (Bearer Token + Manager Role)

### Manager Reports System
**Screen**: `/app/manager/reports/index.tsx`

#### 1. Performance Metrics
**Endpoint**: `GET /manager/reports/performance`
**Query Parameters**: 
- `period`: week, month, quarter, year
- `managerId`: string (optional)
- `societyIds`: comma-separated string
- `includeResolved`: boolean
- `includePending`: boolean
- `performanceThreshold`: number (0-100)

```json
Response:
{
  "success": true,
  "data": {
    "metrics": {
      "period": "month",
      "totalTickets": 156,
      "resolvedTickets": 142,
      "averageResponseTime": 2.5,
      "satisfactionScore": 94,
      "societiesManaged": 3,
      "resolutionRate": 91,
      "trendsData": [
        {
          "date": "2024-01-01",
          "totalTickets": 45,
          "resolvedTickets": 42,
          "averageResponseTime": 2.2,
          "satisfactionScore": 95
        }
      ]
    },
    "managerStats": {
      "totalSocieties": 3,
      "activeSocieties": 3,
      "totalTicketsHandled": 156,
      "avgResponseTime": 2.5,
      "satisfactionRating": 94,
      "performanceGrade": "A",
      "rankingPosition": 2,
      "totalManagers": 8
    }
  }
}
```

#### 2. Society Performance Breakdown
**Endpoint**: `GET /manager/reports/society-performance`

#### 3. Team Comparison
**Endpoint**: `GET /manager/reports/team-comparison`

#### 4. Export Reports
**Endpoint**: `POST /manager/reports/export`
**Request Body**:
```json
{
  "filters": {
    "period": "month",
    "includeResolved": true,
    "includePending": true,
    "performanceThreshold": 75
  },
  "options": {
    "format": "pdf",
    "includeCharts": true,
    "includeDetails": true,
    "societyBreakdown": true,
    "timeSeriesData": true
  }
}
```

### Manager Support Queue
**Screen**: `/app/manager/support/index.tsx`

#### 1. Support Tickets Queue
**Endpoint**: `GET /manager/support/tickets`
**Query Parameters**: 
- `status`: pending, in-progress, resolved, closed
- `priority`: low, medium, high, urgent
- `societyId`: string
- `assignedTo`: string
- `page`: number
- `limit`: number

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "ticket_1",
      "title": "Elevator Maintenance Issue",
      "description": "Elevator in Building A is making unusual noises",
      "category": "maintenance",
      "priority": "high",
      "status": "pending",
      "societyId": "society_1",
      "societyName": "Green Valley Society",
      "reportedBy": "user_123",
      "reporterName": "John Doe",
      "reporterFlat": "A-204",
      "assignedTo": "manager_1",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z",
      "responseTime": null,
      "resolutionTime": null,
      "attachments": [
        {
          "id": "att_1",
          "type": "image",
          "url": "https://api.aptly.app/attachments/elevator_issue.jpg",
          "filename": "elevator_issue.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Update Ticket Status
**Endpoint**: `PATCH /manager/support/tickets/:ticketId/status`
**Request Body**:
```json
{
  "status": "in-progress",
  "assignedTo": "manager_1",
  "notes": "Assigned to maintenance team",
  "estimatedResolution": "2024-01-22T10:00:00.000Z"
}
```

#### 3. Add Ticket Response
**Endpoint**: `POST /manager/support/tickets/:ticketId/responses`

---

## 👨‍💼 Admin Persona Endpoints

### Admin Dashboard
**Screen**: `/app/admin/dashboard.tsx`

#### 1. Admin Dashboard Metrics
**Endpoint**: `GET /admin/dashboard`
**Authentication**: Required (Bearer Token + Super Admin Role)

```json
Response:
{
  "success": true,
  "data": {
    "analytics": {
      "totalSocieties": 245,
      "activeSocieties": 228,
      "totalUsers": 12450,
      "activeUsers": 9876,
      "totalManagers": 48,
      "pendingOnboarding": 12,
      "systemHealth": "operational",
      "monthlyGrowth": {
        "societies": 8,
        "users": 234,
        "managers": 3
      }
    },
    "recentActivity": [
      {
        "id": "activity_1",
        "type": "society_onboarded",
        "description": "Sunshine Apartments successfully onboarded",
        "timestamp": "2024-01-20T14:30:00.000Z",
        "performedBy": "admin_1"
      }
    ],
    "alerts": [
      {
        "id": "alert_1",
        "type": "high_priority",
        "message": "5 societies require manager assignment",
        "severity": "medium",
        "actionRequired": true,
        "createdAt": "2024-01-20T09:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Pending Approvals Count
**Endpoint**: `GET /admin/approvals/count`

#### 3. High Priority Items
**Endpoint**: `GET /admin/alerts/high-priority`

### Society Management
**Screen**: `/app/admin/societies/index.tsx`, `/app/admin/societies/[societyId].tsx`

#### 1. List All Societies
**Endpoint**: `GET /admin/societies`
**Query Parameters**: 
- `status`: active, inactive, pending, suspended
- `managerId`: string
- `search`: string
- `page`: number
- `limit`: number

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "society_1",
      "name": "Green Valley Apartments",
      "code": "GVA001",
      "address": "123 Green Valley Road, Bangalore",
      "totalUnits": 150,
      "occupiedUnits": 142,
      "status": "active",
      "managerId": "manager_1",
      "managerName": "Raj Patel",
      "onboardedAt": "2023-06-15T10:00:00.000Z",
      "lastActivity": "2024-01-20T08:30:00.000Z",
      "healthScore": 85,
      "contactPerson": {
        "name": "Secretary Name",
        "phone": "+91-9876543210",
        "email": "secretary@greenvalley.com"
      },
      "amenities": ["Swimming Pool", "Gym", "Garden", "Parking"],
      "subscription": {
        "plan": "premium",
        "validUntil": "2024-12-31T23:59:59.000Z",
        "status": "active"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 13,
    "totalItems": 245,
    "itemsPerPage": 20
  }
}
```

#### 2. Society Details
**Endpoint**: `GET /admin/societies/:societyId`

#### 3. Update Society
**Endpoint**: `PATCH /admin/societies/:societyId`

#### 4. Society Analytics
**Endpoint**: `GET /admin/societies/:societyId/analytics`

### Manager Assignment System
**Screen**: `/app/admin/managers/index.tsx`

#### 1. List All Managers
**Endpoint**: `GET /admin/managers`
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "manager_1",
      "name": "Raj Patel",
      "email": "raj.patel@aptly.com",
      "phone": "+91-9876543210",
      "role": "community_manager",
      "status": "active",
      "assignedSocieties": [
        {
          "societyId": "society_1",
          "societyName": "Green Valley Apartments",
          "assignedAt": "2023-06-15T10:00:00.000Z"
        }
      ],
      "totalSocieties": 3,
      "performanceStats": {
        "avgResponseTime": 2.5,
        "satisfactionScore": 94,
        "ticketsResolved": 142,
        "performanceGrade": "A"
      },
      "createdAt": "2023-01-15T10:00:00.000Z",
      "lastLogin": "2024-01-20T09:15:00.000Z"
    }
  ]
}
```

#### 2. Assign Manager to Society
**Endpoint**: `POST /admin/managers/assign`
**Request Body**:
```json
{
  "managerId": "manager_1",
  "societyId": "society_1",
  "effectiveDate": "2024-01-21T00:00:00.000Z",
  "notes": "Replacing previous manager due to relocation"
}
```

#### 3. Unassign Manager
**Endpoint**: `DELETE /admin/managers/:managerId/societies/:societyId`

### Society Onboarding
**Screen**: `/app/admin/onboarding/index.tsx`, `/app/admin/onboarding/[requestId].tsx`

#### 1. Onboarding Requests
**Endpoint**: `GET /admin/onboarding/requests`
**Query Parameters**: 
- `status`: pending, under_review, approved, rejected
- `priority`: high, medium, low
- `assignedTo`: string
- `dateRange`: string

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "request_1",
      "societyName": "Sunshine Apartments",
      "contactPerson": {
        "name": "Priya Sharma",
        "designation": "Society Secretary",
        "phone": "+91-9876543210",
        "email": "priya@sunshine.com"
      },
      "address": "456 Sunshine Road, Mumbai",
      "totalUnits": 200,
      "estimatedResidents": 650,
      "amenities": ["Swimming Pool", "Gym", "Club House"],
      "status": "pending",
      "priority": "medium",
      "submittedAt": "2024-01-18T14:30:00.000Z",
      "assignedTo": null,
      "documents": [
        {
          "type": "society_registration",
          "url": "https://api.aptly.app/documents/reg_cert.pdf",
          "verified": false
        },
        {
          "type": "occupancy_certificate",
          "url": "https://api.aptly.app/documents/occ_cert.pdf",
          "verified": true
        }
      ],
      "requirements": {
        "subscriptionPlan": "premium",
        "managerRequired": true,
        "trainingRequired": true,
        "customizations": [
          "Multi-language support",
          "Custom billing module"
        ]
      }
    }
  ]
}
```

#### 2. Review Onboarding Request
**Endpoint**: `PATCH /admin/onboarding/requests/:requestId`
**Request Body**:
```json
{
  "status": "approved",
  "assignedManager": "manager_2",
  "subscriptionPlan": "premium",
  "approvalNotes": "All documents verified and approved",
  "onboardingDate": "2024-01-25T10:00:00.000Z"
}
```

#### 3. Create Society from Request
**Endpoint**: `POST /admin/onboarding/requests/:requestId/create-society`

### Admin Analytics
**Screen**: `/app/admin/analytics/index.tsx`

#### 1. Platform Analytics
**Endpoint**: `GET /admin/analytics/platform`

#### 2. Society Growth Metrics
**Endpoint**: `GET /admin/analytics/growth`

#### 3. Manager Performance Overview
**Endpoint**: `GET /admin/analytics/managers`

#### 4. System Health Metrics
**Endpoint**: `GET /admin/analytics/system-health`

---

## 🛡️ Security Persona Endpoints

### Security Dashboard
**Screen**: `/app/security/dashboard.tsx`

#### 1. Security Dashboard Stats
**Endpoint**: `GET /security/dashboard`
**Authentication**: Required (Bearer Token + Security Role)

```json
Response:
{
  "success": true,
  "data": {
    "stats": {
      "visitorsInside": 12,
      "todayCheckIns": 28,
      "todayCheckOuts": 16,
      "overstayingVisitors": 2,
      "pendingApprovals": 5,
      "vehiclesParked": 18,
      "emergencyAlerts": 0,
      "systemStatus": "operational"
    },
    "recentActivity": [
      {
        "id": "activity_1",
        "type": "visitor_checkin",
        "visitorName": "John Doe",
        "hostFlat": "A-204",
        "timestamp": "2024-01-20T14:30:00.000Z",
        "performedBy": "security_1"
      }
    ],
    "overstayingVisitors": [
      {
        "id": "visitor_1",
        "name": "Jane Smith",
        "hostFlat": "B-105",
        "checkedInAt": "2024-01-20T09:00:00.000Z",
        "expectedDuration": 120,
        "actualDuration": 450,
        "status": "overstaying"
      }
    ]
  }
}
```

#### 2. Security Permissions Status
**Endpoint**: `GET /security/permissions`

### Visitor Management
**Screen**: `/app/security/visitors/index.tsx`, `/app/security/visitors/checkin.tsx`, `/app/security/visitors/checkout.tsx`

#### 1. Security Visitor List
**Endpoint**: `GET /security/visitors`
**Query Parameters**: 
- `status`: pending, approved, checked_in, checked_out, overstaying
- `filter`: today, pending, overstay
- `societyId`: string
- `hostFlat`: string

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "visitor_1",
      "name": "John Doe",
      "phoneNumber": "+91-9876543210",
      "purpose": "Personal visit",
      "category": "Personal",
      "status": "approved",
      "hostFlat": "A-204",
      "hostName": "Priya Sharma",
      "hostPhone": "+91-9876543211",
      "expectedArrival": "2024-01-20T15:00:00.000Z",
      "expectedDuration": 120,
      "vehicleNumber": "KA01AB1234",
      "identityDocument": {
        "type": "driving_license",
        "number": "DL1420110012345",
        "verified": true
      },
      "qrCode": "https://api.aptly.app/qr/visitor_1",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "approvedAt": "2024-01-20T10:05:00.000Z",
      "securityNotes": ""
    }
  ]
}
```

#### 2. Check-in Visitor
**Endpoint**: `POST /security/visitors/:visitorId/checkin`
**Request Body**:
```json
{
  "securityPersonId": "security_1",
  "actualArrivalTime": "2024-01-20T15:05:00.000Z",
  "identityVerified": true,
  "temperatureCheck": 98.6,
  "vehicleParked": true,
  "parkingSlot": "A-15",
  "notes": "ID verified, temperature normal, vehicle parked"
}
```

#### 3. Check-out Visitor
**Endpoint**: `POST /security/visitors/:visitorId/checkout`
**Request Body**:
```json
{
  "securityPersonId": "security_1",
  "actualDepartureTime": "2024-01-20T17:15:00.000Z",
  "vehicleExited": true,
  "notes": "Visit completed, vehicle exited"
}
```

#### 4. Scan QR Code
**Endpoint**: `POST /security/visitors/scan-qr`
**Request Body**:
```json
{
  "qrData": "visitor_1|society_1|A-204|2024-01-20T15:00:00.000Z",
  "scannedBy": "security_1",
  "action": "checkin"
}
```

### Vehicle Management
**Screen**: `/app/security/vehicles/index.tsx`

#### 1. Vehicle Registry
**Endpoint**: `GET /security/vehicles`
**Query Parameters**: 
- `status`: active, temporary, blacklisted
- `vehicleType`: car, bike, bicycle, commercial
- `flatNumber`: string

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "vehicle_1",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "car",
      "make": "Honda",
      "model": "City",
      "color": "White",
      "ownerFlat": "A-204",
      "ownerName": "Priya Sharma",
      "ownerPhone": "+91-9876543210",
      "status": "active",
      "parkingSlot": "A-15",
      "registeredAt": "2023-06-15T10:00:00.000Z",
      "validUntil": "2024-06-15T10:00:00.000Z",
      "documents": {
        "rc": {
          "verified": true,
          "expiryDate": "2028-06-15"
        },
        "insurance": {
          "verified": true,
          "expiryDate": "2024-12-31"
        }
      }
    }
  ]
}
```

#### 2. Register Temporary Vehicle
**Endpoint**: `POST /security/vehicles/temporary`

#### 3. Vehicle Entry/Exit Log
**Endpoint**: `POST /security/vehicles/:vehicleId/entry`
**Endpoint**: `POST /security/vehicles/:vehicleId/exit`

### Emergency Management
**Screen**: `/app/security/emergency/index.tsx`

#### 1. Emergency Alerts
**Endpoint**: `GET /security/emergency/alerts`

#### 2. Create Emergency Alert
**Endpoint**: `POST /security/emergency/alerts`
**Request Body**:
```json
{
  "type": "fire",
  "severity": "high",
  "location": "Building A - 3rd Floor",
  "description": "Fire alarm triggered in corridor",
  "reportedBy": "security_1",
  "affectedAreas": ["Building A"],
  "evacuationRequired": true,
  "emergencyServices": {
    "fire": true,
    "police": false,
    "ambulance": false
  }
}
```

#### 3. Update Emergency Status
**Endpoint**: `PATCH /security/emergency/alerts/:alertId`

---

## 👤 Resident Profile & Settings Endpoints

### Personal Details Management
**Screen**: `/app/(tabs)/settings/personal-details.tsx`

#### 1. Get User Profile
**Endpoint**: `GET /user/profile`
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "id": "user_123",
    "fullName": "Rajesh Kumar Sharma",
    "email": "rajesh.kumar@email.com",
    "phoneNumber": "+91-9876543210",
    "alternatePhone": "+91-8765432109",
    "occupation": "Software Engineer",
    "aadharNumber": "****-****-9012",
    "panNumber": "ABCDE1234F",
    "address": "A-301, Green Valley Apartments, Sector 12, Noida",
    "emergencyContact": {
      "name": "Priya Kumar",
      "relationship": "Wife",
      "phone": "+91-9876543211"
    },
    "profileImage": "https://api.aptly.app/uploads/avatars/user_123.jpg",
    "flatNumber": "A-301",
    "ownershipType": "owner",
    "familySize": 4,
    "moveInDate": "2023-01-15",
    "societyId": "society_1",
    "isVerified": true,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Update Personal Details
**Endpoint**: `PATCH /user/profile`
**Request Body**:
```json
{
  "fullName": "Rajesh Kumar Sharma",
  "email": "rajesh.kumar@newemail.com",
  "alternatePhone": "+91-8765432109",
  "occupation": "Senior Software Engineer",
  "address": "A-301, Green Valley Apartments, Sector 12, Noida"
}
```

#### 3. Upload Profile Picture
**Endpoint**: `POST /user/profile/avatar`
**Content-Type**: `multipart/form-data`

### Family Members Management
**Screen**: `/app/(tabs)/settings/family-members.tsx`

#### 1. Get Family Members
**Endpoint**: `GET /user/family-members`

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "member_1",
      "name": "Priya Kumar",
      "relationship": "spouse",
      "age": 28,
      "occupation": "Teacher",
      "phoneNumber": "+91-9876543211",
      "aadharNumber": "****-****-3456",
      "isDependent": false,
      "hasVotingRights": true,
      "emergencyContact": true,
      "photo": "https://api.aptly.app/uploads/family/member_1.jpg",
      "addedAt": "2023-01-15T10:30:00.000Z"
    },
    {
      "id": "member_2",
      "name": "Arjun Kumar",
      "relationship": "son",
      "age": 8,
      "occupation": "Student",
      "phoneNumber": null,
      "aadharNumber": "****-****-7890",
      "isDependent": true,
      "hasVotingRights": false,
      "emergencyContact": false,
      "photo": null,
      "addedAt": "2023-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Add Family Member
**Endpoint**: `POST /user/family-members`

#### 3. Update Family Member
**Endpoint**: `PATCH /user/family-members/:memberId`

#### 4. Remove Family Member
**Endpoint**: `DELETE /user/family-members/:memberId`

### Vehicle Management
**Screen**: `/app/(tabs)/settings/vehicles.tsx`, `/app/(tabs)/settings/vehicles/add.tsx`

#### 1. Get User Vehicles
**Endpoint**: `GET /user/vehicles`

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "vehicle_1",
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "car",
      "make": "Honda",
      "model": "City",
      "color": "White",
      "fuelType": "petrol",
      "isElectric": false,
      "registeredOwner": "Rajesh Kumar Sharma",
      "rcNumber": "KA0120230012345",
      "insuranceNumber": "INS2023001234",
      "insuranceExpiry": "2024-12-31",
      "pucExpiry": "2024-06-30",
      "status": "active",
      "parkingSlot": "A-15",
      "registeredAt": "2023-01-20T10:00:00.000Z",
      "documents": {
        "rc": {
          "url": "https://api.aptly.app/documents/rc_1.pdf",
          "verified": true,
          "verifiedAt": "2023-01-20T15:00:00.000Z"
        },
        "insurance": {
          "url": "https://api.aptly.app/documents/insurance_1.pdf",
          "verified": true,
          "verifiedAt": "2023-01-20T15:00:00.000Z"
        }
      }
    }
  ]
}
```

#### 2. Add Vehicle
**Endpoint**: `POST /user/vehicles`
**Content-Type**: `multipart/form-data`

#### 3. Update Vehicle
**Endpoint**: `PATCH /user/vehicles/:vehicleId`

#### 4. Delete Vehicle
**Endpoint**: `DELETE /user/vehicles/:vehicleId`

### Document Management
**Screen**: `/app/(tabs)/settings/documents.tsx`

#### 1. Get User Documents
**Endpoint**: `GET /user/documents`

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "doc_1",
      "type": "aadhar_card",
      "name": "Aadhar Card",
      "description": "Government ID proof",
      "documentNumber": "****-****-9012",
      "url": "https://api.aptly.app/documents/aadhar_1.pdf",
      "isVerified": true,
      "verifiedAt": "2023-01-15T12:00:00.000Z",
      "expiryDate": null,
      "uploadedAt": "2023-01-15T10:30:00.000Z"
    },
    {
      "id": "doc_2",
      "type": "pan_card",
      "name": "PAN Card",
      "description": "Permanent Account Number",
      "documentNumber": "ABCDE1234F",
      "url": "https://api.aptly.app/documents/pan_1.pdf",
      "isVerified": true,
      "verifiedAt": "2023-01-15T12:00:00.000Z",
      "expiryDate": null,
      "uploadedAt": "2023-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 2. Upload Document
**Endpoint**: `POST /user/documents`
**Content-Type**: `multipart/form-data`

#### 3. Delete Document
**Endpoint**: `DELETE /user/documents/:documentId`

### Emergency Contacts
**Screen**: `/app/(tabs)/settings/emergency-contacts.tsx`

#### 1. Get Emergency Contacts
**Endpoint**: `GET /user/emergency-contacts`

#### 2. Add Emergency Contact
**Endpoint**: `POST /user/emergency-contacts`

#### 3. Update Emergency Contact
**Endpoint**: `PATCH /user/emergency-contacts/:contactId`

### Notification Preferences
**Screen**: `/app/(tabs)/settings/notifications.tsx`

#### 1. Get Notification Settings
**Endpoint**: `GET /user/notification-settings`

```json
Response:
{
  "success": true,
  "data": {
    "pushNotifications": {
      "enabled": true,
      "visitors": true,
      "notices": true,
      "bills": true,
      "maintenance": true,
      "community": true,
      "security": true,
      "emergency": true,
      "governance": true
    },
    "emailNotifications": {
      "enabled": true,
      "dailyDigest": true,
      "weeklyReport": true,
      "importantUpdates": true,
      "billing": true
    },
    "smsNotifications": {
      "enabled": false,
      "emergency": true,
      "security": false,
      "billing": false
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "07:00"
    },
    "festivalMode": {
      "enabled": true,
      "autoDetect": true,
      "customDates": [
        "2024-03-08",
        "2024-10-24"
      ]
    },
    "language": "en",
    "timezone": "Asia/Kolkata"
  }
}
```

#### 2. Update Notification Settings
**Endpoint**: `PATCH /user/notification-settings`

### Security Settings
**Screen**: `/app/(tabs)/settings/security.tsx`

#### 1. Get Security Settings
**Endpoint**: `GET /user/security-settings`

```json
Response:
{
  "success": true,
  "data": {
    "appLock": {
      "enabled": true,
      "method": "biometric",
      "timeout": 300
    },
    "biometric": {
      "enrolled": true,
      "type": "fingerprint",
      "lastUsed": "2024-01-20T09:15:00.000Z"
    },
    "twoFactorAuth": {
      "enabled": false,
      "method": null,
      "backupCodes": []
    },
    "loginAlerts": {
      "enabled": true,
      "email": true,
      "sms": false
    },
    "privacySettings": {
      "profileVisibility": "society_members",
      "contactInfoVisibility": "family_and_emergency",
      "activityTracking": true,
      "dataSharing": false
    },
    "sessions": [
      {
        "id": "session_1",
        "device": "iPhone 14 Pro",
        "location": "Bangalore, India",
        "ipAddress": "192.168.1.100",
        "lastActivity": "2024-01-20T14:30:00.000Z",
        "isCurrent": true
      }
    ]
  }
}
```

#### 2. Update Security Settings
**Endpoint**: `PATCH /user/security-settings`

#### 3. Biometric Enrollment
**Endpoint**: `POST /user/biometric/enroll`

#### 4. Revoke Session
**Endpoint**: `DELETE /user/sessions/:sessionId`

### Analytics Settings
**Screen**: `/app/(tabs)/settings/analytics-settings.tsx`

#### 1. Get Analytics Preferences
**Endpoint**: `GET /user/analytics-settings`

#### 2. Update Analytics Preferences  
**Endpoint**: `PATCH /user/analytics-settings`

### Governance Settings
**Screen**: `/app/(tabs)/settings/governance-settings.tsx`

#### 1. Get Governance Preferences
**Endpoint**: `GET /user/governance-settings`

#### 2. Get Voting History
**Endpoint**: `GET /user/voting-history`

#### 3. Get Policy Subscriptions
**Endpoint**: `GET /user/policy-subscriptions`

---

## 🔧 Helper Methods & Utilities

### Image Upload Helper
```typescript
interface ImageUploadHelper {
  uploadProfileImage(file: File): Promise<{ url: string; id: string }>;
  uploadDocumentImage(file: File, documentType: string): Promise<{ url: string; id: string }>;
  uploadVehicleDocument(file: File, vehicleId: string, docType: string): Promise<{ url: string; id: string }>;
}
```

### Data Validation Helpers
```typescript
interface ValidationHelpers {
  validateAadhar(number: string): boolean;
  validatePAN(number: string): boolean;
  validatePhone(number: string): boolean;
  validateEmail(email: string): boolean;
  validateVehicleNumber(number: string): boolean;
}
```

### Notification Helpers
```typescript
interface NotificationHelpers {
  sendPushNotification(userId: string, message: NotificationMessage): Promise<void>;
  sendEmailNotification(userId: string, template: string, data: any): Promise<void>;
  sendSMSNotification(phone: string, message: string): Promise<void>;
  scheduleNotification(userId: string, message: NotificationMessage, scheduleTime: Date): Promise<string>;
}
```

### Permission Helpers
```typescript
interface PermissionHelpers {
  checkManagerPermission(userId: string, societyId: string): Promise<boolean>;
  checkAdminPermission(userId: string, action: string): Promise<boolean>;
  checkSecurityPermission(userId: string, societyId: string, action: string): Promise<boolean>;
  getUserPermissionLevel(userId: string): Promise<'basic' | 'elevated' | 'admin'>;
}
```

### Real-time Updates (WebSocket)
```typescript
interface WebSocketEndpoints {
  // Manager real-time updates
  '/ws/manager/dashboard': ManagerDashboardUpdate;
  '/ws/manager/tickets': TicketUpdate;
  
  // Admin real-time updates  
  '/ws/admin/dashboard': AdminDashboardUpdate;
  '/ws/admin/onboarding': OnboardingUpdate;
  
  // Security real-time updates
  '/ws/security/visitors': VisitorUpdate;
  '/ws/security/emergency': EmergencyUpdate;
  '/ws/security/vehicles': VehicleUpdate;
  
  // User real-time updates
  '/ws/user/notifications': NotificationUpdate;
  '/ws/user/family': FamilyUpdate;
}
```

---

## 🚀 Integration Priorities

### Phase 1 (High Priority)
1. **Manager Dashboard & Reports** - Core manager functionality
2. **Security Visitor Management** - Critical security operations
3. **Admin Society Management** - Platform management essentials
4. **User Profile Management** - Core user features

### Phase 2 (Medium Priority)
1. **Manager Support System** - Ticket management
2. **Admin Analytics Dashboard** - Business intelligence
3. **Security Vehicle Management** - Enhanced security
4. **User Document Management** - Compliance features

### Phase 3 (Lower Priority)
1. **Admin Onboarding System** - Growth features  
2. **Security Emergency Management** - Crisis response
3. **User Governance Features** - Community engagement
4. **Advanced Analytics** - Performance optimization

---

## 📝 Notes

1. **Authentication**: All endpoints require Bearer token authentication with role-based access control
2. **Real-time Updates**: WebSocket connections for live dashboard updates
3. **File Uploads**: Use multipart/form-data with proper validation
4. **Error Handling**: Consistent error response format across all endpoints
5. **Rate Limiting**: Implement appropriate rate limits for each endpoint category
6. **Caching**: Cache static data like society lists, manager assignments
7. **Audit Logging**: Track all administrative actions and sensitive operations
8. **Data Privacy**: Mask sensitive information like Aadhar numbers in responses
9. **Pagination**: Implement cursor-based pagination for large datasets
10. **Search & Filtering**: Support advanced filtering on list endpoints

This comprehensive analysis provides the foundation for implementing robust backend services that support all persona-specific screens while maintaining consistency with existing V4 integration patterns.