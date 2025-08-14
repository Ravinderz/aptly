
# API Endpoint Discovery Report

**Base URL:** http://localhost:3000
**Server Health:** ✅ Healthy
**Discovery Time:** 2025-08-10T04:58:22.883Z
**Total Endpoints Tested:** 18
**Working Endpoints:** 2

## Available Endpoints

### GET /health
- **Status:** 200 OK
- **Response Preview:** ```json
{
  "status": "OK",
  "timestamp": "2025-08-10T04:58:22.911Z",
  "uptime": 141.591446667,
  "memory": {
    "rss": 57868288,
    "heapTotal": 35045376,
    "heapUsed": 32715576,
    "external": 3863671,
    "arrayBuffers": 454678
  },
  "environment": "development",
  "version": "1.0.0"
}
```

### GET /api
- **Status:** 200 OK
- **Response Preview:** ```json
"...(large response truncated)"
```


## Failed/Unavailable Endpoints

- GET /api/v4 → 404
- POST /api/v4/auth/login → 404
- POST /api/v4/auth/register → 400
- POST /api/v4/auth/refresh → 401
- POST /api/v4/auth/logout → 401
- GET /auth/me → 404
- GET /api/v4/societies → 404
- POST /api/v4/societies → 400
- GET /api/v4/visitors → 401
- POST /api/v4/visitors → 401
- GET /api/v4/home → 404
- GET /api/v4/home/stats → 404
- GET /api/v4/services/maintenance → 401
- GET /api/v4/services/billing → 404
- GET /api/notices → 401
- GET /api/notices/all → 401

## Integration Recommendations

Based on the discovery, update your API configuration:

1. **Working Auth Endpoints:** Update auth service configuration
2. **Working Data Endpoints:** Update visitors, societies, and home services
3. **Missing Endpoints:** Implement fallback or mock data for unavailable endpoints

---
Generated on 10/8/2025, 10:28:22 am
