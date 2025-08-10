# 🔐 Admin Module Testing Guide

## 🚀 How to Login as Admin and Test Functionality

### **Quick Start - Admin Login**

1. **Start the App**:
   ```bash
   npx expo start --clear
   ```

2. **Navigate to Welcome Screen**:
   - The app should show the welcome screen
   - Look for the development buttons in the **top-right corner**

3. **Choose Your Login Type**:
   - **🔴 ADMIN LOGIN** - Super admin with full permissions
   - **🔵 MANAGER** - Community manager with society-specific permissions  
   - **🟡 RESIDENT** - Regular user with basic permissions

4. **Login as Super Admin**:
   - Tap the **"ADMIN LOGIN"** button (red shield icon)
   - You'll be automatically logged in and redirected to `/admin/dashboard`

## 👤 Test User Accounts

### **Super Admin Account**
```javascript
{
  id: 'super-admin-123',
  name: 'Admin Smith',
  email: 'admin@aptly.app',
  role: 'super_admin',
  permissions: [
    'system.admin',
    'societies.create',
    'societies.update', 
    'societies.delete',
    'societies.view_all',
    'managers.assign',
    'managers.remove',
    'managers.view_performance',
    'onboarding.review',
    'onboarding.approve',
    'reports.view_all'
  ]
}
```

### **Community Manager Account**
```javascript
{
  id: 'manager-123',
  name: 'Manager Johnson',
  email: 'manager@aptly.app',
  role: 'community_manager',
  assignedSocieties: ['dev-society-123', 'society-456'],
  permissions: [
    'society.manage',
    'residents.view',
    'notices.create',
    'billing.manage',
    'maintenance.handle'
  ]
}
```

### **Regular Resident Account**
```javascript
{
  id: 'dev-user-123',
  name: 'John Developer',
  email: 'john@aptly.app',
  role: 'resident',
  flatNumber: 'A-101',
  societyId: 'dev-society-123'
}
```

## 🧪 Admin Functionality Testing

### **1. Admin Dashboard (`/admin/dashboard`)**

**What to Test:**
- ✅ Dashboard loads without errors
- ✅ Real-time metrics display properly
- ✅ Quick action buttons are visible and functional
- ✅ Navigation menu works correctly
- ✅ Permission-based UI elements show/hide appropriately

**Test Steps:**
1. Login as super admin
2. Verify dashboard shows:
   - Total Societies count
   - Active Societies count  
   - Pending Onboarding requests
   - Manager assignments
   - System health status
3. Click on quick action buttons:
   - "Review Onboarding" → should navigate to onboarding page
   - "Manage Societies" → should navigate to societies page
   - "Assign Managers" → should navigate to managers page
   - "View Analytics" → should navigate to analytics page

### **2. Society Onboarding (`/admin/onboarding`)**

**What to Test:**
- ✅ Onboarding requests list loads
- ✅ Filtering by status works (pending, approved, rejected)
- ✅ Individual request details can be viewed
- ✅ Approval/rejection workflow functions
- ✅ Document verification system works

**Test Steps:**
1. Navigate to `/admin/onboarding`
2. Verify page structure:
   - Header with "Society Onboarding" title
   - Filter pills for different statuses
   - List of onboarding requests (may be empty initially)
   - "Add Test Data" button for demo purposes
3. Test filtering:
   - Click different status filters
   - Verify requests filter accordingly
4. Test request review:
   - Click on a request to view details
   - Try approving/rejecting requests
   - Add review notes

### **3. Society Management (`/admin/societies`)**

**What to Test:**
- ✅ Society list displays correctly
- ✅ Search functionality works
- ✅ Status filtering works
- ✅ Society details can be viewed
- ✅ Bulk operations function

**Test Steps:**
1. Navigate to `/admin/societies`
2. Verify society list:
   - Shows society cards with basic info
   - Status badges display correctly
   - Search bar works
   - Filter options function
3. Test society operations:
   - View society details
   - Update society status
   - Assign managers to societies

### **4. Manager Assignment (`/admin/managers`)**

**What to Test:**
- ✅ Manager list displays
- ✅ Assignment interface works
- ✅ Assignment types are selectable
- ✅ Performance tracking displays
- ✅ Assignment history is visible

**Test Steps:**
1. Navigate to `/admin/managers`
2. Verify manager interface:
   - Available managers list
   - Assignment form functions
   - Assignment types work (permanent/temporary/interim)
   - Performance metrics display
3. Test assignment workflow:
   - Assign manager to society
   - Set assignment dates
   - Add assignment notes

### **5. Analytics Dashboard (`/admin/analytics`)**

**What to Test:**
- ✅ Analytics charts load
- ✅ Time range filtering works
- ✅ Metrics are comprehensive
- ✅ Export functionality works
- ✅ Data visualization is clear

**Test Steps:**
1. Navigate to `/admin/analytics`
2. Verify analytics display:
   - Revenue charts
   - User growth metrics
   - Society performance data
   - Support ticket analytics
3. Test filtering:
   - Change time ranges (7d, 30d, 90d, 1y)
   - Verify charts update accordingly
4. Test export functionality:
   - Try exporting data
   - Verify export formats work

### **6. System Settings (`/admin/settings`)**

**What to Test:**
- ✅ Settings interface loads
- ✅ Notification preferences can be updated
- ✅ Security settings are configurable
- ✅ System maintenance controls work
- ✅ Cache management functions

**Test Steps:**
1. Navigate to `/admin/settings`
2. Verify settings sections:
   - Notification preferences
   - Security configuration
   - System maintenance
   - Cache management
3. Test setting updates:
   - Toggle notification preferences
   - Update security settings
   - Clear system cache

## 🔒 Permission Testing

### **Access Control Validation**

**Test SuperAdminGate:**
1. **As Super Admin**: Should access all admin features
2. **As Community Manager**: Should be redirected or see limited features
3. **As Resident**: Should be denied access to admin areas

**Test Steps:**
1. Login as each user type
2. Try accessing `/admin/dashboard`
3. Verify appropriate access control:
   - Super admin: Full access
   - Manager: Limited or redirected
   - Resident: Access denied

### **Permission-Based UI**

**What to Test:**
- ✅ Buttons show/hide based on permissions
- ✅ Menu items filter correctly
- ✅ Actions are enabled/disabled appropriately
- ✅ Error messages for unauthorized actions

**Test Steps:**
1. Compare UI elements across different user roles
2. Verify permission-based rendering
3. Test unauthorized action attempts

## 🚨 Error Handling Testing

### **Common Error Scenarios**

**Network Errors:**
1. Turn off internet connection
2. Try performing admin actions
3. Verify error handling and user feedback

**Authentication Errors:**
1. Clear auth tokens manually
2. Try accessing admin features
3. Verify redirect to login

**Permission Errors:**
1. Login as lower-privilege user
2. Try accessing restricted features
3. Verify proper error messages

## 📱 Mobile Responsiveness Testing

### **Screen Size Testing**

**Test on different screen sizes:**
- Phone (iOS/Android)
- Tablet (iPad/Android tablet)
- Different orientations (portrait/landscape)

**What to Verify:**
- ✅ Navigation adapts to screen size
- ✅ Cards and lists display properly
- ✅ Forms are usable on mobile
- ✅ Buttons are properly sized
- ✅ Text is readable

## 🔧 Development Testing Tools

### **Console Logging**

**Check for:**
- No error messages in console
- Proper state updates logged
- API calls working correctly
- Store subscriptions functioning

### **React DevTools**

**Verify:**
- Component tree structure
- State updates in stores
- Performance (no excessive re-renders)
- Zustand store states

### **Network Tab**

**Monitor:**
- API calls to admin endpoints
- Authentication headers
- Response data
- Error responses

## 📊 Performance Testing

### **Load Testing**

**Test with:**
- Large lists of societies
- Many onboarding requests
- Multiple manager assignments
- Heavy analytics data

**Monitor:**
- App performance
- Memory usage
- Render times
- Scroll performance

### **Store Performance**

**Verify:**
- Fast state updates
- Efficient re-renders
- Proper data caching
- Memory management

## ✅ Testing Checklist

### **Core Functionality**
- [ ] Admin login works
- [ ] Dashboard loads and displays metrics
- [ ] Navigation between admin sections works
- [ ] All admin pages load without errors
- [ ] RBAC (Role-Based Access Control) functions correctly

### **Society Onboarding**
- [ ] Onboarding list displays
- [ ] Request filtering works
- [ ] Request details can be viewed
- [ ] Approval/rejection workflow functions
- [ ] Status updates properly

### **Society Management**
- [ ] Society list loads
- [ ] Search and filtering work
- [ ] Society details accessible
- [ ] Status management functions
- [ ] Manager assignment works

### **Manager Assignment**
- [ ] Manager list displays
- [ ] Assignment form works
- [ ] Assignment types selectable
- [ ] Performance metrics show
- [ ] Assignment history visible

### **Analytics & Reporting**
- [ ] Charts and metrics load
- [ ] Time filtering works
- [ ] Data is comprehensive
- [ ] Export functionality works
- [ ] Performance is acceptable

### **Security & Permissions**
- [ ] SuperAdminGate blocks unauthorized users
- [ ] Permission checks work throughout
- [ ] UI adapts based on user role
- [ ] Sensitive data is protected
- [ ] Audit logging functions

### **User Experience**
- [ ] Loading states show appropriately
- [ ] Error messages are user-friendly
- [ ] Success feedback is clear
- [ ] Navigation is intuitive
- [ ] Mobile responsive design works

## 🎯 Success Criteria

The admin module testing is successful when:

1. **✅ All admin features are accessible** to super admin users
2. **✅ Permission system works correctly** for different user roles
3. **✅ All CRUD operations function** without errors
4. **✅ Real-time updates work** across the admin interface
5. **✅ Mobile responsiveness is maintained** across devices
6. **✅ Error handling provides good UX** in failure scenarios
7. **✅ Performance is acceptable** with reasonable load times
8. **✅ Security measures are effective** in protecting admin features

## 🐛 Common Issues & Solutions

### **Issue: Admin dashboard not loading**
**Solution:** Check authentication state and permissions

### **Issue: Permission errors**
**Solution:** Verify user role and permission array

### **Issue: Navigation not working**
**Solution:** Check Expo Router configuration and file structure

### **Issue: Store state not updating**
**Solution:** Verify Zustand store subscriptions and migration hooks

### **Issue: UI components not rendering**
**Solution:** Check component imports and Tailwind class names

---

## 🚀 Quick Test Commands

```bash
# Start the app
npx expo start --clear

# Reset storage for clean testing
# (Run in Expo DevTools console)
AsyncStorage.clear()

# Check store state
# (Run in React DevTools)
useAdminStore.getState()
```

**Ready to test the admin module! Login as super admin and explore all the powerful administrative features.** 🎉