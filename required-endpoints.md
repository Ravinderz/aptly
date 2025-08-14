# Aptly App - REST API Endpoints Documentation

## Overview
This document outlines all the necessary REST API endpoints for the Aptly society management app, focusing on Authentication, Home Page, and Visitors Page functionality.

**Base URL**: `https://api.aptly.app/v4`

---

## 🔐 Authentication Endpoints

### 1. Phone Number Registration
**Endpoint**: `POST /auth/register`
**Description**: Initiate phone number registration with society code verification

### 2. OTP Verification
**Endpoint**: `POST /auth/verify-otp`
**Description**: Verify OTP and create authentication tokens

### 3. Create User Profile
**Endpoint**: `POST /auth/profile`
**Description**: Create complete user profile after OTP verification
**Authentication**: Required (Bearer Token)

### 4. Get Current User
**Endpoint**: `GET /auth/me`
**Description**: Get current authenticated user details
**Authentication**: Required (Bearer Token)

### 5. Refresh Token
**Endpoint**: `POST /auth/refresh`
**Description**: Refresh expired access token using refresh token

### 6. Logout
**Endpoint**: `POST /auth/logout`
**Description**: Logout user and invalidate tokens
**Authentication**: Required (Bearer Token)

### 7. Society Association
**Endpoint**: `POST /auth/associate-society`
**Description**: Associate user with a society
**Authentication**: Required (Bearer Token)

---

## 🏠 Home Page Endpoints

### 1. Get Society Notices
**Endpoint**: `GET /notices`
**Description**: Get society notices for home page display
**Authentication**: Required (Bearer Token)

### 2. Get Society Overview
**Endpoint**: `GET /society/overview`
**Description**: Get society overview information for home page
**Authentication**: Required (Bearer Token)

### 3. Get Quick Actions
**Endpoint**: `GET /quick-actions`
**Description**: Get available quick actions for user
**Authentication**: Required (Bearer Token)

### 4. Get Home Dashboard Data
**Endpoint**: `GET /dashboard/home`
**Description**: Get all home page data in single request (notices, visitors, weather, etc.)
**Authentication**: Required (Bearer Token)

### 5. Get Billing Summary
**Endpoint**: `GET /billing/summary`
**Description**: Get billing summary for home page widget
**Authentication**: Required (Bearer Token)

---

## 👥 Visitors Management Endpoints

### 1. Get Visitors List
**Endpoint**: `GET /visitors`
**Description**: Get list of visitors with filtering and pagination
**Authentication**: Required (Bearer Token)

### 2. Get Upcoming Visitors
**Endpoint**: `GET /visitors/upcoming`
**Description**: Get upcoming visitors for home page display
**Authentication**: Required (Bearer Token)

### 3. Create Visitor Entry
**Endpoint**: `POST /visitors`
**Description**: Create a new visitor entry
**Authentication**: Required (Bearer Token)

### 4. Update Visitor Status
**Endpoint**: `PATCH /visitors/:id/status`
**Description**: Approve or reject a visitor
**Authentication**: Required (Bearer Token)

### 5. Reschedule Visitor
**Endpoint**: `PATCH /visitors/:id/reschedule`
**Description**: Reschedule a visitor's appointment
**Authentication**: Required (Bearer Token)

### 6. Get Visitor QR Code
**Endpoint**: `GET /visitors/:id/qr`
**Description**: Get visitor QR code details
**Authentication**: Required (Bearer Token)

### 7. Check-in Visitor
**Endpoint**: `POST /visitors/:id/checkin`
**Description**: Mark visitor as checked in (typically called by security)
**Authentication**: Required (Bearer Token)

### 8. Check-out Visitor
**Endpoint**: `POST /visitors/:id/checkout`
**Description**: Mark visitor as checked out
**Authentication**: Required (Bearer Token)

### 9. Delete Visitor Entry
**Endpoint**: `DELETE /visitors/:id`
**Description**: Delete a visitor entry (only for pending/future visitors)
**Authentication**: Required (Bearer Token)

### 10. Get Visitor Statistics
**Endpoint**: `GET /visitors/stats`
**Description**: Get visitor statistics for dashboard
**Authentication**: Required (Bearer Token)

---

## 🚀 Added endpoints based on codebase analysis

---

## 👮 Admin Endpoints

### 1. Get Admin Dashboard Stats
**Endpoint**: `GET /admin/dashboard/stats`
**Description**: Get statistics for the admin dashboard
**Authentication**: Required (Bearer Token, Admin Role)

```json
Response:
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "activeUsers": 450,
    "pendingApprovals": 10,
    "openComplaints": 5
  },
  "timestamp": "2024-01-01T11:55:00.000Z"
}
```

### 2. Get All Users
**Endpoint**: `GET /admin/users`
**Description**: Get a list of all users with filtering and pagination
**Authentication**: Required (Bearer Token, Admin Role)

### 3. Get User by ID
**Endpoint**: `GET /admin/users/:id`
**Description**: Get details for a specific user
**Authentication**: Required (Bearer Token, Admin Role)

### 4. Update User Role
**Endpoint**: `PATCH /admin/users/:id/role`
**Description**: Update the role of a user
**Authentication**: Required (Bearer Token, Admin Role)

```json
Request Body:
{
  "role": "manager"
}
```

### 5. Get All Complaints
**Endpoint**: `GET /admin/complaints`
**Description**: Get a list of all complaints with filtering and pagination
**Authentication**: Required (Bearer Token, Admin Role)

### 6. Get Complaint by ID
**Endpoint**: `GET /admin/complaints/:id`
**Description**: Get details for a specific complaint
**Authentication**: Required (Bearer Token, Admin Role)

### 7. Update Complaint Status
**Endpoint**: `PATCH /admin/complaints/:id/status`
**Description**: Update the status of a complaint
**Authentication**: Required (Bearer Token, Admin Role)

```json
Request Body:
{
  "status": "resolved"
}
```

---

## 💵 Billing Endpoints

### 1. Get All Bills for a User
**Endpoint**: `GET /users/:userId/bills`
**Description**: Get a list of all bills for a specific user
**Authentication**: Required (Bearer Token, Admin Role)

### 2. Create Bill for a User
**Endpoint**: `POST /users/:userId/bills`
**Description**: Create a new bill for a specific user
**Authentication**: Required (Bearer Token, Admin Role)

```json
Request Body:
{
  "type": "maintenance",
  "amount": 5500,
  "dueDate": "2024-01-25T23:59:59.000Z",
  "month": "2024-01"
}
```

### 3. Get All Payments
**Endpoint**: `GET /payments`
**Description**: Get a list of all payments with filtering and pagination
**Authentication**: Required (Bearer Token, Admin Role)

---

## 💬 Community Endpoints

### 1. Get All Posts
**Endpoint**: `GET /community/posts`
**Description**: Get a list of all community posts with filtering and pagination
**Authentication**: Required (Bearer Token)

### 2. Create Post
**Endpoint**: `POST /community/posts`
**Description**: Create a new community post
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "title": "Community Event",
  "content": "Join us for a community event this weekend!"
}
```

### 3. Get Post by ID
**Endpoint**: `GET /community/posts/:id`
**Description**: Get details for a specific community post
**Authentication**: Required (Bearer Token)

### 4. Delete Post
**Endpoint**: `DELETE /community/posts/:id`
**Description**: Delete a community post
**Authentication**: Required (Bearer Token, Admin Role or Post Author)

---

## 🗳️ Governance Endpoints

### 1. Get All Polls
**Endpoint**: `GET /governance/polls`
**Description**: Get a list of all polls with filtering and pagination
**Authentication**: Required (Bearer Token)

### 2. Create Poll
**Endpoint**: `POST /governance/polls`
**Description**: Create a new poll
**Authentication**: Required (Bearer Token, Admin Role)

```json
Request Body:
{
  "question": "Should we build a new playground?",
  "options": ["Yes", "No"]
}
```

### 3. Get Poll by ID
**Endpoint**: `GET /governance/polls/:id`
**Description**: Get details for a specific poll
**Authentication**: Required (Bearer Token)

### 4. Vote on Poll
**Endpoint**: `POST /governance/polls/:id/vote`
**Description**: Vote on a poll
**Authentication**: Required (Bearer Token)

```json
Request Body:
{
  "option": "Yes"
}
```

---

## 🛡️ Security Endpoints

### 1. Get All Security Guards
**Endpoint**: `GET /security/guards`
**Description**: Get a list of all security guards
**Authentication**: Required (Bearer Token, Admin Role)

### 2. Get Security Guard by ID
**Endpoint**: `GET /security/guards/:id`
**Description**: Get details for a specific security guard
**Authentication**: Required (Bearer Token, Admin Role)

### 3. Get Security Log
**Endpoint**: `GET /security/log`
**Description**: Get the security log with filtering and pagination
**Authentication**: Required (Bearer Token, Admin Role)

---

## 👨‍💼 Manager Endpoints

### 1. Get Manager Dashboard Stats
**Endpoint**: `GET /manager/dashboard/stats`
**Description**: Get statistics for the manager dashboard
**Authentication**: Required (Bearer Token, Manager Role)

### 2. Get Assigned Complaints
**Endpoint**: `GET /manager/complaints`
**Description**: Get a list of complaints assigned to the manager
**Authentication**: Required (Bearer Token, Manager Role)

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