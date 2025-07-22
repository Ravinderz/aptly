// Admin Theme System - Navy/Gold Professional Theme

export interface AdminThemeColors {
  // Primary colors (Navy based)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContrast: string;
  
  // Secondary colors (Gold based)
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryContrast: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral colors
  slate: string;
  slateLight: string;
  slateDark: string;
  
  // Background hierarchy
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnPrimary: string;
  textOnSecondary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Admin-specific colors
  adminAccent: string;
  adminDanger: string;
  adminApproval: string;
  adminPending: string;
}

export const adminTheme: AdminThemeColors = {
  // Navy-based primary palette
  primary: '#1e293b',           // Deep Navy
  primaryLight: '#334155',      // Lighter Navy
  primaryDark: '#0f172a',       // Darker Navy
  primaryContrast: '#ffffff',   // White for contrast
  
  // Gold-based secondary palette
  secondary: '#f59e0b',         // Amber Gold
  secondaryLight: '#fbbf24',    // Lighter Gold
  secondaryDark: '#d97706',     // Darker Gold
  secondaryContrast: '#1e293b', // Navy for contrast
  
  // Professional status colors
  success: '#10b981',           // Emerald
  warning: '#f97316',          // Orange
  error: '#ef4444',            // Red
  info: '#3b82f6',             // Blue
  
  // Neutral slate palette
  slate: '#475569',            // Medium slate
  slateLight: '#64748b',       // Light slate
  slateDark: '#334155',        // Dark slate
  
  // Background system
  background: '#f8fafc',       // Very light slate
  surface: '#ffffff',          // White
  surfaceElevated: '#f1f5f9',  // Elevated surface
  surfaceHover: '#e2e8f0',     // Hover state
  
  // Text hierarchy
  textPrimary: '#0f172a',      // Dark navy for primary text
  textSecondary: '#475569',    // Medium slate for secondary
  textTertiary: '#64748b',     // Light slate for tertiary
  textInverse: '#ffffff',      // White for dark backgrounds
  textOnPrimary: '#ffffff',    // White on navy
  textOnSecondary: '#1e293b',  // Navy on gold
  
  // Border system
  border: '#e2e8f0',          // Light border
  borderLight: '#f1f5f9',     // Very light border
  borderDark: '#cbd5e1',      // Darker border
  
  // Admin-specific semantic colors
  adminAccent: '#f59e0b',     // Gold for admin indicators
  adminDanger: '#dc2626',     // Red for critical actions
  adminApproval: '#059669',   // Green for approvals
  adminPending: '#d97706'     // Orange for pending items
};

// Resident theme colors for comparison
export const residentTheme = {
  primary: '#6366f1',         // Indigo
  secondary: '#4CAF50',       // Green
  background: '#ffffff',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#6b7280'
};

// Theme utility functions
export const getThemeForMode = (mode: 'resident' | 'admin') => {
  return mode === 'admin' ? adminTheme : residentTheme;
};

export const getAdminStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'approved': adminTheme.adminApproval,
    'pending': adminTheme.adminPending,
    'rejected': adminTheme.adminDanger,
    'completed': adminTheme.success,
    'in_progress': adminTheme.info,
    'overdue': adminTheme.error,
    'draft': adminTheme.slate,
    'published': adminTheme.success,
    'emergency': adminTheme.adminDanger,
    'high_priority': adminTheme.warning,
    'normal': adminTheme.slate
  };
  
  return statusColors[status] || adminTheme.slate;
};

// CSS-in-JS styles for admin components
export const adminStyles = {
  // Container styles
  container: {
    backgroundColor: adminTheme.background,
    flex: 1
  },
  
  surface: {
    backgroundColor: adminTheme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: adminTheme.border
  },
  
  elevatedSurface: {
    backgroundColor: adminTheme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: adminTheme.border,
    shadowColor: adminTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  
  // Header styles
  adminHeader: {
    backgroundColor: adminTheme.primary,
    borderBottomWidth: 2,
    borderBottomColor: adminTheme.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  
  residentHeader: {
    backgroundColor: residentTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  
  // Button styles
  adminPrimaryButton: {
    backgroundColor: adminTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  adminSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: adminTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  adminAccentButton: {
    backgroundColor: adminTheme.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Text styles with admin typography
  adminHeading: {
    fontSize: 24,
    fontWeight: '700' as const, // Bolder for authority
    color: adminTheme.textPrimary,
    marginBottom: 8
  },
  
  adminSubheading: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: adminTheme.textPrimary,
    marginBottom: 4
  },
  
  adminBody: {
    fontSize: 16,
    fontWeight: '500' as const, // Medium weight for readability
    color: adminTheme.textSecondary,
    lineHeight: 24
  },
  
  adminLabel: {
    fontSize: 14,
    fontWeight: '600' as const, // Strong labels
    color: adminTheme.textSecondary,
    marginBottom: 4
  },
  
  adminCaption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: adminTheme.textTertiary
  },
  
  // Card styles
  adminCard: {
    backgroundColor: adminTheme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: adminTheme.border,
    padding: 16,
    marginBottom: 16,
    shadowColor: adminTheme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  
  adminCardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: adminTheme.borderLight,
    paddingBottom: 12,
    marginBottom: 12
  },
  
  // Input styles
  adminInput: {
    borderWidth: 2,
    borderColor: adminTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    color: adminTheme.textPrimary,
    backgroundColor: adminTheme.surface
  },
  
  adminInputFocused: {
    borderColor: adminTheme.primary,
    shadowColor: adminTheme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  
  adminInputError: {
    borderColor: adminTheme.error
  },
  
  // Navigation styles
  adminTabBar: {
    backgroundColor: adminTheme.primary,
    borderTopWidth: 2,
    borderTopColor: adminTheme.secondary,
    paddingBottom: 8
  },
  
  adminTabItem: {
    alignItems: 'center',
    paddingVertical: 8
  },
  
  adminTabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4
  },
  
  adminTabTextActive: {
    color: adminTheme.secondary
  },
  
  adminTabTextInactive: {
    color: adminTheme.textInverse,
    opacity: 0.7
  },
  
  // Status indicators
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Mode toggle styles
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: adminTheme.surfaceElevated,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: adminTheme.border
  },
  
  modeToggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  modeToggleOptionActive: {
    backgroundColor: adminTheme.primary
  },
  
  modeToggleOptionInactive: {
    backgroundColor: 'transparent'
  }
};

// Tailwind CSS classes for admin theme
export const adminTailwindClasses = {
  // Colors
  'bg-admin-primary': 'bg-[#1e293b]',
  'bg-admin-secondary': 'bg-[#f59e0b]',
  'text-admin-primary': 'text-[#1e293b]',
  'text-admin-secondary': 'text-[#f59e0b]',
  'border-admin-primary': 'border-[#1e293b]',
  'border-admin-secondary': 'border-[#f59e0b]',
  
  // Status colors
  'bg-admin-success': 'bg-[#10b981]',
  'bg-admin-warning': 'bg-[#f97316]',
  'bg-admin-error': 'bg-[#ef4444]',
  'text-admin-success': 'text-[#10b981]',
  'text-admin-warning': 'text-[#f97316]',
  'text-admin-error': 'text-[#ef4444]',
  
  // Surfaces
  'bg-admin-surface': 'bg-white',
  'bg-admin-elevated': 'bg-[#f1f5f9]',
  'bg-admin-background': 'bg-[#f8fafc]',
  
  // Text
  'text-admin-text-primary': 'text-[#0f172a]',
  'text-admin-text-secondary': 'text-[#475569]',
  'text-admin-text-tertiary': 'text-[#64748b]',
  'text-admin-text-inverse': 'text-white',
  
  // Admin-specific
  'shadow-admin': 'shadow-lg shadow-[#1e293b]/15',
  'border-admin': 'border-[#e2e8f0]'
};

// Helper function to generate admin-themed component styles
export const createAdminComponentStyle = (
  baseStyle: any,
  mode: 'resident' | 'admin'
) => {
  if (mode === 'resident') {
    return baseStyle;
  }
  
  // Apply admin theme transformations
  return {
    ...baseStyle,
    borderColor: adminTheme.border,
    shadowColor: adminTheme.primary,
    // Add more admin-specific style transformations as needed
  };
};

export default adminTheme;