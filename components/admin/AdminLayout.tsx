import React, { ReactNode } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { AdminHeader, SimpleAdminHeader } from './AdminHeader';
import { QuickAdminNav } from './AdminNavigation';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { adminStyles } from '@/utils/adminTheme';

// Import TouchableOpacity and Text for the custom components
import { TouchableOpacity, Text } from 'react-native';

interface AdminLayoutProps {
  children: ReactNode;
  headerType?: 'full' | 'simple';
  title?: string;
  subtitle?: string;
  showSocietySelector?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  showBottomNav?: boolean;
  scrollable?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  onBackPress?: () => void;
  customHeaderActions?: ReactNode;
  emergencyAlerts?: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  headerType = 'full',
  title,
  subtitle,
  showSocietySelector = true,
  showNotifications = true,
  showSearch = false,
  showMenu = false,
  showBottomNav = false,
  scrollable = true,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  onSettingsPress,
  onBackPress,
  customHeaderActions,
  emergencyAlerts = 0,
}) => {
  const { currentMode } = useDirectAdmin();

  // Don't render admin layout in resident mode
  if (currentMode !== 'admin') {
    return null;
  }

  const ContentComponent = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { showsVerticalScrollIndicator: false }
    : { style: { flex: 1 } };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: adminStyles.container.backgroundColor,
      }}>
      {/* Header */}
      {headerType === 'full' ? (
        <AdminHeader
          title={title}
          subtitle={subtitle}
          showSocietySelector={showSocietySelector}
          showNotifications={showNotifications}
          showSearch={showSearch}
          showMenu={showMenu}
          onMenuPress={onMenuPress}
          onSearchPress={onSearchPress}
          onNotificationPress={onNotificationPress}
          onSettingsPress={onSettingsPress}
          customActions={customHeaderActions}
          emergencyAlerts={emergencyAlerts}
        />
      ) : (
        <SimpleAdminHeader
          title={title || 'Admin Panel'}
          onBack={onBackPress}
          rightAction={customHeaderActions}
        />
      )}

      {/* Main Content */}
      <ContentComponent style={{ flex: 1 }} {...contentProps}>
        {children}
      </ContentComponent>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <QuickAdminNav
          onNavigate={(screen) => console.log(`Navigate to: ${screen}`)}
        />
      )}
    </SafeAreaView>
  );
};

// Specific layout variants for common use cases
export const AdminDashboardLayout: React.FC<{
  children: ReactNode;
  emergencyAlerts?: number;
}> = ({ children, emergencyAlerts }) => (
  <AdminLayout
    headerType="full"
    title="Admin Dashboard"
    showSocietySelector={true}
    showNotifications={true}
    showMenu={true}
    showBottomNav={true}
    scrollable={true}
    emergencyAlerts={emergencyAlerts}
    onMenuPress={() => console.log('Open menu')}
    onSearchPress={() => console.log('Open search')}
    onNotificationPress={() => console.log('Open notifications')}
    onSettingsPress={() => console.log('Open settings')}>
    {children}
  </AdminLayout>
);

export const AdminFormLayout: React.FC<{
  children: ReactNode;
  title: string;
  onBack?: () => void;
  onSave?: () => void;
  saveText?: string;
}> = ({ children, title, onBack, onSave, saveText = 'Save' }) => (
  <AdminLayout
    headerType="simple"
    title={title}
    scrollable={true}
    onBackPress={onBack}
    customHeaderActions={
      onSave ? (
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onPress={onSave}>
          <Text
            style={{
              color: '#f59e0b',
              fontSize: 14,
              fontWeight: '600',
            }}>
            {saveText}
          </Text>
        </TouchableOpacity>
      ) : undefined
    }>
    {children}
  </AdminLayout>
);

export const AdminListLayout: React.FC<{
  children: ReactNode;
  title: string;
  showSearch?: boolean;
  onSearch?: () => void;
  onAdd?: () => void;
  addText?: string;
}> = ({
  children,
  title,
  showSearch = true,
  onSearch,
  onAdd,
  addText = 'Add',
}) => (
  <AdminLayout
    headerType="full"
    title={title}
    showSearch={showSearch}
    scrollable={false}
    onSearchPress={onSearch}
    customHeaderActions={
      onAdd ? (
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
          onPress={onAdd}>
          <Text
            style={{
              color: '#f59e0b',
              fontSize: 14,
              fontWeight: '600',
            }}>
            {addText}
          </Text>
        </TouchableOpacity>
      ) : undefined
    }>
    {children}
  </AdminLayout>
);

export default AdminLayout;
