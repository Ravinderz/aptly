# Aptly App - REST API Endpoints Documentation

## Overview
This document outlines all the necessary REST API endpoints for the Aptly society management app, focusing on Authentication, Home Page, and Visitors Page functionality.

**Base URL**: `https://api.aptly.app/v4`

---

## 🔐 Authentication Endpoints

### 1. Phone Number Registration
**Endpoint**: `POST /auth/register`
**Description**: Initiate phone number registration with society code verification

```json
Request Body:
{
  "phoneNumber": "+919876543210",
  "societyCode": "DEMO001"
}

Response:
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "sessionId": "session_1640995200000",
    "expiresAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 2. OTP Verification
**Endpoint**: `POST /auth/verify-otp`
**Description**: Verify OTP and create authentication tokens

```json
Request Body:
{
  "sessionId": "session_1640995200000",
  "otp": "123456"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-02T11:55:00.000Z",
    "tokenType": "Bearer",
    "requiresProfileSetup": true
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 3. Create User Profile
**Endpoint**: `POST /auth/profile`
**Description**: Create complete user profile after OTP verification
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "fullName": "John Doe",
  "flatNumber": "A-101",
  "ownershipType": "owner",
  "familySize": 4,
  "emergencyContact": "+919876543211",
  "societyId": "society_1",
  "moveInDate": "2024-01-01"
}

Response:
{
  "success": true,
  "data": {
    "id": "user_1640995200000",
    "phoneNumber": "+919876543210",
    "fullName": "John Doe",
    "flatNumber": "A-101",
    "ownershipType": "owner",
    "familySize": 4,
    "emergencyContact": "+919876543211",
    "role": "resident",
    "societyId": "society_1",
    "societyCode": "DEMO001",
    "isVerified": true,
    "createdAt": "2024-01-01T11:55:00.000Z"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 4. Get Current User
**Endpoint**: `GET /auth/me`
**Description**: Get current authenticated user details
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "id": "user_1640995200000",
    "phoneNumber": "+919876543210",
    "fullName": "John Doe",
    "flatNumber": "A-101",
    "ownershipType": "owner",
    "familySize": 4,
    "emergencyContact": "+919876543211",
    "role": "resident",
    "societyId": "society_1",
    "societyCode": "DEMO001",
    "isVerified": true,
    "avatar": "https://api.aptly.app/uploads/avatars/user_123.jpg",
    "lastLoginAt": "2024-01-01T11:55:00.000Z",
    "createdAt": "2024-01-01T11:55:00.000Z"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 5. Refresh Token
**Endpoint**: `POST /auth/refresh`
**Description**: Refresh expired access token using refresh token

```json
Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-02T11:55:00.000Z",
    "tokenType": "Bearer"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 6. Logout
**Endpoint**: `POST /auth/logout`
**Description**: Logout user and invalidate tokens
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 7. Society Association
**Endpoint**: `POST /auth/associate-society`
**Description**: Associate user with a society
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "userId": "user_1640995200000",
  "societyId": "society_1",
  "flatNumber": "A-101"
}

Response:
{
  "success": true,
  "data": {
    "message": "Successfully associated with society",
    "societyName": "Green Valley Apartments",
    "flatNumber": "A-101",
    "verificationStatus": "pending"
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

---

## 🏠 Home Page Endpoints

### 1. Get Society Notices
**Endpoint**: `GET /notices`
**Description**: Get society notices for home page display
**Authentication**: Required (Bearer Token)
**Query Parameters**: 
- `limit` (optional): Number of notices to retrieve (default: 5)
- `priority` (optional): Filter by priority (low, medium, high)
- `category` (optional): Filter by category (maintenance, community, security, general)

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "notice_1",
      "title": "Water Supply Maintenance",
      "content": "Water supply will be interrupted tomorrow (Jan 20) from 10 AM to 2 PM for tank cleaning. Please store water in advance.",
      "category": "maintenance",
      "priority": "high",
      "variant": "warning",
      "createdAt": "2024-01-19T09:00:00.000Z",
      "expiresAt": "2024-01-21T18:00:00.000Z",
      "authorName": "Society Admin",
      "isActive": true
    },
    {
      "id": "notice_2",
      "title": "Society Meeting This Weekend",
      "content": "Monthly society meeting scheduled for Saturday 6 PM in the community hall.",
      "category": "community",
      "priority": "medium",
      "variant": "info",
      "createdAt": "2024-01-18T14:30:00.000Z",
      "expiresAt": "2024-01-22T18:00:00.000Z",
      "authorName": "Society Secretary",
      "isActive": true
    }
  ],
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 2. Get Society Overview
**Endpoint**: `GET /society/overview`
**Description**: Get society overview information for home page
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "societyInfo": {
      "id": "society_1",
      "name": "Green Valley Apartments",
      "code": "DEMO001",
      "totalFlats": 120,
      "occupiedFlats": 108,
      "address": "123 Green Valley Road, Bangalore",
      "amenities": ["Swimming Pool", "Gym", "Garden", "Parking"]
    },
    "userInfo": {
      "flatNumber": "A-101",
      "ownershipType": "owner",
      "familySize": 4,
      "moveInDate": "2024-01-01"
    },
    "stats": {
      "totalResidents": 350,
      "activeNotices": 3,
      "pendingMaintenance": 5,
      "upcomingEvents": 2
    }
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 3. Get Quick Actions
**Endpoint**: `GET /quick-actions`
**Description**: Get available quick actions for user
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "add_visitor",
      "label": "Add Visitor",
      "icon": "bookUser",
      "color": "#6366f1",
      "route": "/visitor/add",
      "enabled": true
    },
    {
      "id": "request_service",
      "label": "Request Service",
      "icon": "wrench",
      "color": "#6366f1",
      "route": "/services/maintenance",
      "enabled": true
    },
    {
      "id": "request_maintenance",
      "label": "Request Maintenance",
      "icon": "briefcaseBusiness",
      "color": "#6366f1",
      "route": "/services/maintenance/create",
      "enabled": true
    },
    {
      "id": "raise_complaint",
      "label": "Raise Complaint",
      "icon": "phoneCall",
      "color": "#6366f1",
      "route": "/services/complaints/create",
      "enabled": true
    }
  ],
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 4. Get Home Dashboard Data
**Endpoint**: `GET /dashboard/home`
**Description**: Get all home page data in single request (notices, visitors, weather, etc.)
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "notices": [...], // Same as GET /notices
    "upcomingVisitors": [...], // Same as GET /visitors/upcoming
    "weather": {
      "temperature": 28,
      "condition": "sunny",
      "humidity": 65,
      "windSpeed": 12,
      "location": "Bangalore"
    },
    "quickStats": {
      "pendingVisitors": 2,
      "todayVisitors": 5,
      "activeNotices": 3,
      "pendingBills": 1
    }
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 5. Get Billing Summary
**Endpoint**: `GET /billing/summary`
**Description**: Get billing summary for home page widget
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "pendingBills": [
      {
        "id": "bill_1",
        "type": "maintenance",
        "amount": 5500,
        "dueDate": "2024-01-25T23:59:59.000Z",
        "month": "2024-01",
        "status": "pending"
      }
    ],
    "totalPending": 5500,
    "nextDueDate": "2024-01-25T23:59:59.000Z",
    "paymentHistory": {
      "lastPayment": {
        "amount": 5500,
        "date": "2023-12-15T10:30:00.000Z",
        "method": "upi"
      }
    }
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

---

## 👥 Visitors Management Endpoints

### 1. Get Visitors List
**Endpoint**: `GET /visitors`
**Description**: Get list of visitors with filtering and pagination
**Authentication**: Required (Bearer Token)
**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (pending, approved, rejected, completed)
- `category` (optional): Filter by category (Personal, Delivery, Service, Official)
- `date` (optional): Filter by date (today, tomorrow, yesterday, or YYYY-MM-DD)
- `search` (optional): Search by name, purpose, or phone

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "visitor_1",
      "name": "Nishant Kumar",
      "phoneNumber": "+919876543210",
      "purpose": "Family visit",
      "status": "approved",
      "category": "Personal",
      "date": "2024-01-20",
      "time": "10:00",
      "timeFormat": "10:00 AM",
      "hostFlatNumber": "A-101",
      "hostName": "John Doe",
      "vehicleNumber": "KA01AB1234",
      "expectedDuration": 120,
      "qrCode": "https://api.aptly.app/qr/visitor_1",
      "createdAt": "2024-01-19T15:30:00.000Z",
      "approvedBy": "John Doe",
      "approvedAt": "2024-01-19T15:35:00.000Z"
    },
    {
      "id": "visitor_2",
      "name": "Amazon Delivery",
      "phoneNumber": "+919876543211",
      "purpose": "Package delivery",
      "status": "pending",
      "category": "Delivery",
      "date": "2024-01-20",
      "time": "11:00",
      "timeFormat": "11:00 AM",
      "hostFlatNumber": "A-101",
      "hostName": "John Doe",
      "expectedDuration": 15,
      "createdAt": "2024-01-20T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 2. Get Upcoming Visitors
**Endpoint**: `GET /visitors/upcoming`
**Description**: Get upcoming visitors for home page display
**Authentication**: Required (Bearer Token)
**Query Parameters**:
- `limit` (optional): Number of visitors to retrieve (default: 5)

```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "visitor_1",
      "name": "Amazon Delivery",
      "date": "Today",
      "time": "2:30 PM",
      "status": "approved",
      "category": "Delivery",
      "purpose": "Package delivery",
      "phoneNumber": "+919876543211"
    }
  ],
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 3. Create Visitor Entry
**Endpoint**: `POST /visitors`
**Description**: Create a new visitor entry
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "name": "John Smith",
  "phoneNumber": "+919876543212",
  "purpose": "Business meeting",
  "category": "Official",
  "date": "2024-01-21",
  "time": "14:30",
  "expectedDuration": 60,
  "vehicleNumber": "KA01CD5678",
  "hostFlatNumber": "A-101",
  "identityDocument": {
    "type": "aadhar",
    "number": "1234-5678-9012"
  },
  "isPreApproved": false
}

Response:
{
  "success": true,
  "data": {
    "id": "visitor_3",
    "name": "John Smith",
    "phoneNumber": "+919876543212",
    "purpose": "Business meeting",
    "status": "pending",
    "category": "Official",
    "date": "2024-01-21",
    "time": "14:30",
    "timeFormat": "2:30 PM",
    "expectedDuration": 60,
    "vehicleNumber": "KA01CD5678",
    "hostFlatNumber": "A-101",
    "hostName": "John Doe",
    "qrCode": "https://api.aptly.app/qr/visitor_3",
    "createdAt": "2024-01-20T10:15:00.000Z",
    "expiresAt": "2024-01-21T15:30:00.000Z"
  },
  "timestamp": "2024-01-20T10:15:00.000Z"
}
```

### 4. Update Visitor Status
**Endpoint**: `PATCH /visitors/:id/status`
**Description**: Approve or reject a visitor
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "status": "approved", // or "rejected"
  "rejectionReason": "Not available at home" // required if status is rejected
}

Response:
{
  "success": true,
  "data": {
    "id": "visitor_2",
    "status": "approved",
    "approvedBy": "John Doe",
    "approvedAt": "2024-01-20T09:00:00.000Z",
    "qrCode": "https://api.aptly.app/qr/visitor_2",
    "message": "Visitor has been approved and notified via SMS"
  },
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

### 5. Reschedule Visitor
**Endpoint**: `PATCH /visitors/:id/reschedule`
**Description**: Reschedule a visitor's appointment
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "date": "2024-01-22",
  "time": "15:00",
  "reason": "Host not available at original time"
}

Response:
{
  "success": true,
  "data": {
    "id": "visitor_2",
    "date": "2024-01-22",
    "time": "15:00",
    "timeFormat": "3:00 PM",
    "rescheduledAt": "2024-01-20T09:30:00.000Z",
    "rescheduledBy": "John Doe",
    "reason": "Host not available at original time",
    "qrCode": "https://api.aptly.app/qr/visitor_2_updated",
    "message": "Visitor has been rescheduled and notified via SMS"
  },
  "timestamp": "2024-01-20T09:30:00.000Z"
}
```

### 6. Get Visitor QR Code
**Endpoint**: `GET /visitors/:id/qr`
**Description**: Get visitor QR code details
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "id": "visitor_1",
    "name": "Nishant Kumar",
    "qrCode": "https://api.aptly.app/qr/visitor_1",
    "qrData": {
      "visitorId": "visitor_1",
      "societyCode": "DEMO001",
      "hostFlat": "A-101",
      "validUntil": "2024-01-20T12:00:00.000Z"
    },
    "isValid": true,
    "expiresAt": "2024-01-20T12:00:00.000Z"
  },
  "timestamp": "2024-01-20T09:00:00.000Z"
}
```

### 7. Check-in Visitor
**Endpoint**: `POST /visitors/:id/checkin`
**Description**: Mark visitor as checked in (typically called by security)
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "securityPersonId": "security_1",
  "actualArrivalTime": "2024-01-20T10:05:00.000Z",
  "notes": "ID verified, visitor checked in"
}

Response:
{
  "success": true,
  "data": {
    "id": "visitor_1",
    "status": "checked_in",
    "checkedInAt": "2024-01-20T10:05:00.000Z",
    "checkedInBy": "Security Guard 1",
    "actualArrivalTime": "2024-01-20T10:05:00.000Z"
  },
  "timestamp": "2024-01-20T10:05:00.000Z"
}
```

### 8. Check-out Visitor
**Endpoint**: `POST /visitors/:id/checkout`
**Description**: Mark visitor as checked out
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "securityPersonId": "security_1",
  "actualDepartureTime": "2024-01-20T12:15:00.000Z",
  "notes": "Visit completed successfully"
}

Response:
{
  "success": true,
  "data": {
    "id": "visitor_1",
    "status": "checked_out",  
    "checkedOutAt": "2024-01-20T12:15:00.000Z",
    "checkedOutBy": "Security Guard 1",
    "actualDepartureTime": "2024-01-20T12:15:00.000Z",
    "actualDuration": 130,
    "visitSummary": {
      "plannedDuration": 120,
      "actualDuration": 130,
      "variance": 10
    }
  },
  "timestamp": "2024-01-20T12:15:00.000Z"
}
```

### 9. Delete Visitor Entry
**Endpoint**: `DELETE /visitors/:id`
**Description**: Delete a visitor entry (only for pending/future visitors)
**Authentication**: Required (Bearer Token)

```json
Response:
{
  "success": true,
  "data": {
    "message": "Visitor entry deleted successfully",
    "deletedId": "visitor_3"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 10. Get Visitor Statistics
**Endpoint**: `GET /visitors/stats`
**Description**: Get visitor statistics for dashboard
**Authentication**: Required (Bearer Token)
**Query Parameters**:
- `period` (optional): today, week, month (default: today)

```json
Response:
{
  "success": true,
  "data": {
    "period": "today",
    "totalVisitors": 8,
    "pending": 2,
    "approved": 3,
    "checkedIn": 2,
    "completed": 1,
    "rejected": 0,
    "byCategory": {
      "Personal": 3,
      "Delivery": 3,
      "Service": 1,
      "Official": 1
    },
    "trends": {
      "comparedToPrevious": "+25%",
      "averageVisitDuration": 45
    }
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

---

## 🔄 Common Response Patterns

### Success Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message",
  "timestamp": "2024-01-01T11:55:00.000Z",
  "requestId": "req_1640995200000"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "statusCode": 400,
    "details": {
      "field": "phoneNumber",
      "reason": "Invalid phone number format"
    }
  },
  "timestamp": "2024-01-01T11:55:00.000Z",
  "requestId": "req_1640995200000"
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

---

## 🔒 Authentication & Security

### Headers Required
```
Authorization: Bearer <access_token>
Content-Type: application/json
X-Society-Code: DEMO001 (for multi-society apps)
X-Device-ID: device_unique_id
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found  
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

### Rate Limiting
- Auth endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload: 10 requests per minute

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. Phone numbers should include country code (+91 for India)
3. All endpoints support CORS for web applications
4. WebSocket connections available for real-time updates
5. File uploads use multipart/form-data with separate endpoints
6. QR codes are generated server-side and include validation data
7. Society codes are case-insensitive but stored in uppercase
8. Visitor entries auto-expire after 24 hours if not checked in

This API documentation covers all the essential endpoints needed for the Authentication, Home Page, and Visitors Page functionality of the Aptly app.