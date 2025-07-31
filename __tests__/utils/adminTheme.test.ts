import {
  adminTheme,
  residentTheme,
  getThemeForMode,
  getAdminStatusColor,
  adminStyles,
  adminTailwindClasses,
  createAdminComponentStyle,
  AdminThemeColors,
} from '../../utils/adminTheme';

describe('Admin Theme Utilities', () => {
  describe('adminTheme', () => {
    test('should have all required color properties', () => {
      // Primary colors
      expect(adminTheme.primary).toBe('#1e293b');
      expect(adminTheme.primaryLight).toBe('#334155');
      expect(adminTheme.primaryDark).toBe('#0f172a');
      expect(adminTheme.primaryContrast).toBe('#ffffff');

      // Secondary colors
      expect(adminTheme.secondary).toBe('#f59e0b');
      expect(adminTheme.secondaryLight).toBe('#fbbf24');
      expect(adminTheme.secondaryDark).toBe('#d97706');
      expect(adminTheme.secondaryContrast).toBe('#1e293b');

      // Status colors
      expect(adminTheme.success).toBe('#10b981');
      expect(adminTheme.warning).toBe('#f97316');
      expect(adminTheme.error).toBe('#ef4444');
      expect(adminTheme.info).toBe('#3b82f6');
    });

    test('should have consistent navy and gold color scheme', () => {
      // Primary should be navy-based
      expect(adminTheme.primary).toContain('#');
      expect(adminTheme.primaryLight).toContain('#');
      expect(adminTheme.primaryDark).toContain('#');

      // Secondary should be gold-based (amber)
      expect(adminTheme.secondary).toContain('#f59e0b');
      expect(adminTheme.secondaryLight).toContain('#fbbf24');
      expect(adminTheme.secondaryDark).toContain('#d97706');
    });

    test('should have proper text hierarchy colors', () => {
      expect(adminTheme.textPrimary).toBe('#0f172a');
      expect(adminTheme.textSecondary).toBe('#475569');
      expect(adminTheme.textTertiary).toBe('#64748b');
      expect(adminTheme.textInverse).toBe('#ffffff');
      expect(adminTheme.textOnPrimary).toBe('#ffffff');
      expect(adminTheme.textOnSecondary).toBe('#1e293b');
    });

    test('should have complete background system', () => {
      expect(adminTheme.background).toBe('#f8fafc');
      expect(adminTheme.surface).toBe('#ffffff');
      expect(adminTheme.surfaceElevated).toBe('#f1f5f9');
      expect(adminTheme.surfaceHover).toBe('#e2e8f0');
    });

    test('should have border color variations', () => {
      expect(adminTheme.border).toBe('#e2e8f0');
      expect(adminTheme.borderLight).toBe('#f1f5f9');
      expect(adminTheme.borderDark).toBe('#cbd5e1');
    });

    test('should have admin-specific semantic colors', () => {
      expect(adminTheme.adminAccent).toBe('#f59e0b');
      expect(adminTheme.adminDanger).toBe('#dc2626');
      expect(adminTheme.adminApproval).toBe('#059669');
      expect(adminTheme.adminPending).toBe('#d97706');
    });
  });

  describe('residentTheme', () => {
    test('should have resident-specific colors', () => {
      expect(residentTheme.primary).toBe('#6366f1'); // Indigo
      expect(residentTheme.secondary).toBe('#4CAF50'); // Green
      expect(residentTheme.background).toBe('#ffffff');
      expect(residentTheme.surface).toBe('#ffffff');
      expect(residentTheme.textPrimary).toBe('#111827');
      expect(residentTheme.textSecondary).toBe('#6b7280');
    });

    test('should be different from admin theme', () => {
      expect(residentTheme.primary).not.toBe(adminTheme.primary);
      expect(residentTheme.secondary).not.toBe(adminTheme.secondary);
    });
  });

  describe('getThemeForMode', () => {
    test('should return admin theme for admin mode', () => {
      const theme = getThemeForMode('admin');
      expect(theme).toBe(adminTheme);
      expect(theme.primary).toBe('#1e293b');
    });

    test('should return resident theme for resident mode', () => {
      const theme = getThemeForMode('resident');
      expect(theme).toBe(residentTheme);
      expect(theme.primary).toBe('#6366f1');
    });

    test('should default to resident theme for invalid mode', () => {
      // @ts-ignore - testing invalid input
      const theme = getThemeForMode('invalid');
      expect(theme).toBe(residentTheme);
    });
  });

  describe('getAdminStatusColor', () => {
    test('should return correct colors for all status types', () => {
      expect(getAdminStatusColor('approved')).toBe(adminTheme.adminApproval);
      expect(getAdminStatusColor('pending')).toBe(adminTheme.adminPending);
      expect(getAdminStatusColor('rejected')).toBe(adminTheme.adminDanger);
      expect(getAdminStatusColor('completed')).toBe(adminTheme.success);
      expect(getAdminStatusColor('in_progress')).toBe(adminTheme.info);
      expect(getAdminStatusColor('overdue')).toBe(adminTheme.error);
      expect(getAdminStatusColor('draft')).toBe(adminTheme.slate);
      expect(getAdminStatusColor('published')).toBe(adminTheme.success);
      expect(getAdminStatusColor('emergency')).toBe(adminTheme.adminDanger);
      expect(getAdminStatusColor('high_priority')).toBe(adminTheme.warning);
      expect(getAdminStatusColor('normal')).toBe(adminTheme.slate);
    });

    test('should return default color for unknown status', () => {
      expect(getAdminStatusColor('unknown_status')).toBe(adminTheme.slate);
      expect(getAdminStatusColor('')).toBe(adminTheme.slate);
    });

    test('should handle case sensitivity', () => {
      expect(getAdminStatusColor('APPROVED')).toBe(adminTheme.slate); // Case sensitive
      expect(getAdminStatusColor('Pending')).toBe(adminTheme.slate); // Case sensitive
    });
  });

  describe('adminStyles', () => {
    test('should have container styles', () => {
      expect(adminStyles.container.backgroundColor).toBe(adminTheme.background);
      expect(adminStyles.container.flex).toBe(1);
    });

    test('should have surface styles with proper border radius', () => {
      expect(adminStyles.surface.backgroundColor).toBe(adminTheme.surface);
      expect(adminStyles.surface.borderRadius).toBe(8);
      expect(adminStyles.surface.borderWidth).toBe(1);
      expect(adminStyles.surface.borderColor).toBe(adminTheme.border);
    });

    test('should have elevated surface with shadow properties', () => {
      expect(adminStyles.elevatedSurface.shadowColor).toBe(adminTheme.primary);
      expect(adminStyles.elevatedSurface.shadowOffset).toEqual({
        width: 0,
        height: 4,
      });
      expect(adminStyles.elevatedSurface.shadowOpacity).toBe(0.15);
      expect(adminStyles.elevatedSurface.shadowRadius).toBe(12);
      expect(adminStyles.elevatedSurface.elevation).toBe(4);
    });

    test('should have distinct admin and resident header styles', () => {
      expect(adminStyles.adminHeader.backgroundColor).toBe(adminTheme.primary);
      expect(adminStyles.adminHeader.borderBottomWidth).toBe(2);
      expect(adminStyles.adminHeader.borderBottomColor).toBe(
        adminTheme.secondary,
      );

      expect(adminStyles.residentHeader.backgroundColor).toBe(
        residentTheme.primary,
      );
      expect(adminStyles.residentHeader.backgroundColor).not.toBe(
        adminTheme.primary,
      );
    });

    test('should have button variants with proper styling', () => {
      // Primary button
      expect(adminStyles.adminPrimaryButton.backgroundColor).toBe(
        adminTheme.primary,
      );
      expect(adminStyles.adminPrimaryButton.borderRadius).toBe(8);
      expect(adminStyles.adminPrimaryButton.alignItems).toBe('center');

      // Secondary button
      expect(adminStyles.adminSecondaryButton.backgroundColor).toBe(
        'transparent',
      );
      expect(adminStyles.adminSecondaryButton.borderWidth).toBe(2);
      expect(adminStyles.adminSecondaryButton.borderColor).toBe(
        adminTheme.primary,
      );

      // Accent button
      expect(adminStyles.adminAccentButton.backgroundColor).toBe(
        adminTheme.secondary,
      );
    });

    test('should have text styles with proper typography hierarchy', () => {
      expect(adminStyles.adminHeading.fontSize).toBe(24);
      expect(adminStyles.adminHeading.fontWeight).toBe('700');
      expect(adminStyles.adminHeading.color).toBe(adminTheme.textPrimary);

      expect(adminStyles.adminSubheading.fontSize).toBe(18);
      expect(adminStyles.adminSubheading.fontWeight).toBe('600');

      expect(adminStyles.adminBody.fontSize).toBe(16);
      expect(adminStyles.adminBody.fontWeight).toBe('500');
      expect(adminStyles.adminBody.lineHeight).toBe(24);

      expect(adminStyles.adminLabel.fontSize).toBe(14);
      expect(adminStyles.adminLabel.fontWeight).toBe('600');

      expect(adminStyles.adminCaption.fontSize).toBe(12);
      expect(adminStyles.adminCaption.fontWeight).toBe('500');
    });

    test('should have input styles with focus and error states', () => {
      expect(adminStyles.adminInput.borderWidth).toBe(2);
      expect(adminStyles.adminInput.borderColor).toBe(adminTheme.border);
      expect(adminStyles.adminInput.backgroundColor).toBe(adminTheme.surface);

      expect(adminStyles.adminInputFocused.borderColor).toBe(
        adminTheme.primary,
      );
      expect(adminStyles.adminInputError.borderColor).toBe(adminTheme.error);
    });

    test('should have navigation styles', () => {
      expect(adminStyles.adminTabBar.backgroundColor).toBe(adminTheme.primary);
      expect(adminStyles.adminTabBar.borderTopWidth).toBe(2);
      expect(adminStyles.adminTabBar.borderTopColor).toBe(adminTheme.secondary);

      expect(adminStyles.adminTabTextActive.color).toBe(adminTheme.secondary);
      expect(adminStyles.adminTabTextInactive.color).toBe(
        adminTheme.textInverse,
      );
      expect(adminStyles.adminTabTextInactive.opacity).toBe(0.7);
    });

    test('should have mode toggle styles', () => {
      expect(adminStyles.modeToggle.flexDirection).toBe('row');
      expect(adminStyles.modeToggle.backgroundColor).toBe(
        adminTheme.surfaceElevated,
      );

      expect(adminStyles.modeToggleOptionActive.backgroundColor).toBe(
        adminTheme.primary,
      );
      expect(adminStyles.modeToggleOptionInactive.backgroundColor).toBe(
        'transparent',
      );
    });
  });

  describe('adminTailwindClasses', () => {
    test('should have color utility classes', () => {
      expect(adminTailwindClasses['bg-admin-primary']).toBe('bg-[#1e293b]');
      expect(adminTailwindClasses['bg-admin-secondary']).toBe('bg-[#f59e0b]');
      expect(adminTailwindClasses['text-admin-primary']).toBe('text-[#1e293b]');
      expect(adminTailwindClasses['text-admin-secondary']).toBe(
        'text-[#f59e0b]',
      );
    });

    test('should have status color classes', () => {
      expect(adminTailwindClasses['bg-admin-success']).toBe('bg-[#10b981]');
      expect(adminTailwindClasses['bg-admin-warning']).toBe('bg-[#f97316]');
      expect(adminTailwindClasses['bg-admin-error']).toBe('bg-[#ef4444]');
      expect(adminTailwindClasses['text-admin-success']).toBe('text-[#10b981]');
    });

    test('should have surface utility classes', () => {
      expect(adminTailwindClasses['bg-admin-surface']).toBe('bg-white');
      expect(adminTailwindClasses['bg-admin-elevated']).toBe('bg-[#f1f5f9]');
      expect(adminTailwindClasses['bg-admin-background']).toBe('bg-[#f8fafc]');
    });

    test('should have text utility classes', () => {
      expect(adminTailwindClasses['text-admin-text-primary']).toBe(
        'text-[#0f172a]',
      );
      expect(adminTailwindClasses['text-admin-text-secondary']).toBe(
        'text-[#475569]',
      );
      expect(adminTailwindClasses['text-admin-text-tertiary']).toBe(
        'text-[#64748b]',
      );
      expect(adminTailwindClasses['text-admin-text-inverse']).toBe(
        'text-white',
      );
    });

    test('should have admin-specific utility classes', () => {
      expect(adminTailwindClasses['shadow-admin']).toBe(
        'shadow-lg shadow-[#1e293b]/15',
      );
      expect(adminTailwindClasses['border-admin']).toBe('border-[#e2e8f0]');
    });
  });

  describe('createAdminComponentStyle', () => {
    const baseStyle = {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      padding: 16,
    };

    test('should return base style for resident mode', () => {
      const result = createAdminComponentStyle(baseStyle, 'resident');
      expect(result).toEqual(baseStyle);
    });

    test('should apply admin transformations for admin mode', () => {
      const result = createAdminComponentStyle(baseStyle, 'admin');

      expect(result.backgroundColor).toBe(baseStyle.backgroundColor);
      expect(result.borderRadius).toBe(baseStyle.borderRadius);
      expect(result.padding).toBe(baseStyle.padding);
      expect(result.borderColor).toBe(adminTheme.border);
      expect(result.shadowColor).toBe(adminTheme.primary);
    });

    test('should preserve original properties while adding admin styles', () => {
      const complexBaseStyle = {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 20,
        margin: 10,
        flex: 1,
        alignItems: 'center' as const,
      };

      const result = createAdminComponentStyle(complexBaseStyle, 'admin');

      expect(result.margin).toBe(10);
      expect(result.flex).toBe(1);
      expect(result.alignItems).toBe('center');
      expect(result.borderColor).toBe(adminTheme.border);
      expect(result.shadowColor).toBe(adminTheme.primary);
    });

    test('should handle empty base style', () => {
      const result = createAdminComponentStyle({}, 'admin');

      expect(result.borderColor).toBe(adminTheme.border);
      expect(result.shadowColor).toBe(adminTheme.primary);
    });
  });

  describe('color consistency', () => {
    test('should have valid hex color formats', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.values(adminTheme).forEach((value) => {
        if (typeof value === 'string') {
          expect(value).toMatch(hexColorRegex);
        }
      });
    });

    test('should have admin accent matching secondary color', () => {
      expect(adminTheme.adminAccent).toBe(adminTheme.secondary);
    });

    test('should have text on primary being white for contrast', () => {
      expect(adminTheme.textOnPrimary).toBe('#ffffff');
      expect(adminTheme.primaryContrast).toBe('#ffffff');
    });

    test('should have text on secondary being navy for contrast', () => {
      expect(adminTheme.textOnSecondary).toBe('#1e293b');
      expect(adminTheme.secondaryContrast).toBe('#1e293b');
    });
  });

  describe('TypeScript type safety', () => {
    test('should satisfy AdminThemeColors interface', () => {
      const theme: AdminThemeColors = adminTheme;
      expect(theme).toBeDefined();
      expect(theme.primary).toBeDefined();
      expect(theme.secondary).toBeDefined();
      expect(theme.success).toBeDefined();
    });

    test('should have proper fontWeight types in styles', () => {
      expect(adminStyles.adminHeading.fontWeight).toBe('700');
      expect(adminStyles.adminSubheading.fontWeight).toBe('600');
      expect(adminStyles.adminBody.fontWeight).toBe('500');
    });
  });
});
