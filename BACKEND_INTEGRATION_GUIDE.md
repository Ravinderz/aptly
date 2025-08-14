# Backend Integration Guide

**Current Status:** ✅ API Configuration Complete, Backend Connected  
**Next Steps:** Implement backend endpoints to match mobile app requirements

## 🔗 Current Connection Status

✅ **Connected to backend:** `http://localhost:3000`  
✅ **Working endpoints:** `/health`, `/api`  
⚠️ **Missing endpoints:** Most application endpoints need implementation

## 📱 Mobile App → Backend Endpoint Mapping

### Priority 1: Authentication (Required for app login)

| Mobile Feature | Backend Endpoint Needed | Method | Description |
|---|---|---|---|
| Phone Registration | `POST /auth/register` | POST | Register new user with phone |
| OTP Verification | `POST /auth/verify-otp` | POST | Verify OTP code |
| Login | `POST /auth/login` | POST | User login |
| Token Refresh | `POST /auth/refresh` | POST | Refresh access token |

**Expected Request/Response:**
```typescript
// POST /auth/login
Request: { phone: string, password?: string }
Response: { 
  success: true, 
  data: { 
    user: { id, name, phone, role },
    tokens: { accessToken, refreshToken, expiresIn }
  } 
}
```

### Priority 2: Core Data Endpoints

| Mobile Screen | Backend Endpoint | Method | Current Status |
|---|---|---|---|
| Visitor Management | `GET /api/visitors` | GET | ❌ Not implemented |
| Add Visitor | `POST /api/visitors` | POST | ❌ Not implemented |
| Notice Board | `GET /api/notices` | GET | ❌ Not implemented |
| User Profile | `GET /api/users/profile` | GET | ❌ Not implemented |

### Priority 3: Admin/Manager/Security Features

| Mobile Screen | Backend Endpoint | Method | Status |
|---|---|---|---|
| Admin Dashboard | `GET /api/admin/dashboard` | GET | ❌ Not implemented |
| Manager Dashboard | `GET /api/manager/dashboard` | GET | ❌ Not implemented |
| Security Dashboard | `GET /api/security/dashboard` | GET | ❌ Not implemented |
| Emergency Management | `GET /api/security/emergency` | GET | ❌ Not implemented |
| Vehicle Management | `GET /api/security/vehicles` | GET | ❌ Not implemented |
| Reports | `GET /api/manager/reports` | GET | ❌ Not implemented |
| Support Tickets | `GET /api/manager/support` | GET | ❌ Not implemented |

## 🚀 Quick Start Integration

### Step 1: Test Current Setup
```bash
# The mobile app is already configured to connect to your backend
# Access the API tester screen in the app: /dev-api-test

# Or test manually:
curl http://localhost:3000/health
curl http://localhost:3000/api
```

### Step 2: Implement Authentication First
Your backend should implement these endpoints:

```javascript
// Example Express.js routes
app.post('/auth/register', async (req, res) => {
  const { phone, name } = req.body;
  // Implement user registration
  res.json({
    success: true,
    data: { message: 'OTP sent to phone' }
  });
});

app.post('/auth/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  // Verify OTP and create user
  res.json({
    success: true,
    data: {
      user: { id: 1, name: 'John Doe', phone, role: 'resident' },
      tokens: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600
      }
    }
  });
});

app.post('/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  // Authenticate user
  res.json({
    success: true,
    data: {
      user: { id: 1, name: 'John Doe', phone, role: 'resident' },
      tokens: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600
      }
    }
  });
});
```

### Step 3: Implement Core Data Endpoints
```javascript
// Visitors endpoint
app.get('/api/visitors', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Visitor Name',
        phone: '+1234567890',
        purpose: 'Meeting',
        checkInTime: new Date().toISOString(),
        status: 'checked-in'
      }
    ]
  });
});

// Add visitor endpoint
app.post('/api/visitors', authenticate, async (req, res) => {
  const { name, phone, purpose } = req.body;
  res.json({
    success: true,
    data: {
      id: Date.now(),
      name,
      phone,
      purpose,
      checkInTime: new Date().toISOString(),
      status: 'checked-in'
    }
  });
});
```

## 📊 Mobile App Testing

### Current Test Screen Available
- Navigate to `/dev-api-test` in your mobile app (development only)
- This screen will test all endpoints and show which ones work
- Update the screen as you implement new endpoints

### Expected Response Format
All endpoints should return this format:
```typescript
{
  success: boolean;
  data?: any;          // Response data
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {             // For pagination/lists
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

## 🔐 Authentication Flow

The mobile app expects this authentication flow:

1. **Registration:** `POST /auth/register` → OTP sent
2. **OTP Verification:** `POST /auth/verify-otp` → User created + tokens
3. **Login:** `POST /auth/login` → User authenticated + tokens
4. **API Calls:** Include `Authorization: Bearer <token>` header
5. **Token Refresh:** Automatic refresh when token expires

## 📝 Implementation Checklist

### Phase 1: Authentication (Week 1)
- [ ] `POST /auth/register` - Send OTP
- [ ] `POST /auth/verify-otp` - Verify and create user
- [ ] `POST /auth/login` - User login
- [ ] `POST /auth/refresh` - Token refresh
- [ ] JWT middleware for protected routes

### Phase 2: Core Features (Week 2)
- [ ] `GET /api/visitors` - List visitors
- [ ] `POST /api/visitors` - Add visitor
- [ ] `GET /api/notices` - Get notices
- [ ] `GET /api/users/profile` - User profile
- [ ] Role-based permissions

### Phase 3: Admin Features (Week 3)
- [ ] `GET /api/admin/dashboard` - Admin stats
- [ ] `GET /api/admin/users` - User management
- [ ] `GET /api/admin/onboarding` - Onboarding requests
- [ ] `POST /api/admin/onboarding/{id}/approve` - Approve requests

### Phase 4: Manager Features (Week 4)
- [ ] `GET /api/manager/dashboard` - Manager overview
- [ ] `GET /api/manager/reports` - Performance reports
- [ ] `GET /api/manager/support` - Support tickets
- [ ] `POST /api/manager/support/{id}/respond` - Respond to tickets

### Phase 5: Security Features (Week 5)
- [ ] `GET /api/security/dashboard` - Security overview
- [ ] `GET /api/security/emergency` - Emergency alerts
- [ ] `POST /api/security/emergency` - Create emergency alert
- [ ] `GET /api/security/vehicles` - Vehicle management
- [ ] `POST /api/security/vehicles` - Register vehicle

## 🚀 Testing Your Implementation

As you implement each endpoint, test it with:

```bash
# Test in browser/Postman
curl -X GET http://localhost:3000/api/visitors \
  -H "Authorization: Bearer your-jwt-token"

# Test with the mobile app
# Use the /dev-api-test screen to verify integration
```

## 📱 Mobile App Configuration

The mobile app is already configured with:
- ✅ API Base URL: `http://localhost:3000`
- ✅ Authentication handling with automatic token refresh
- ✅ Error handling and retry logic
- ✅ Loading states and user feedback
- ✅ Network security configuration for localhost

## 🆘 Troubleshooting

### Common Issues:

**CORS Issues:**
```javascript
// Add to your Express app
app.use(cors({
  origin: ['http://localhost:8081', 'exp://192.168.1.x:8081'],
  credentials: true
}));
```

**Authentication Issues:**
- Ensure JWT tokens are valid and not expired
- Check token format: `Bearer <token>`
- Verify user roles match endpoint requirements

**Mobile Connection Issues:**
- Android: Use `http://10.0.2.2:3000` for emulator
- iOS: Use your computer's local IP address
- Ensure network security config allows cleartext traffic

---

**Next Steps:**
1. Implement authentication endpoints first
2. Test with mobile app using `/dev-api-test` screen  
3. Gradually add core endpoints and test integration
4. Implement role-specific features (admin/manager/security)

The mobile app is production-ready and waiting for your backend endpoints! 🚀