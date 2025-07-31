import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import {
  Bell,
  Settings,
  Shield,
  ChevronDown,
  Menu,
  Search,
  AlertTriangle,
} from 'lucide-react-native';
import { useAdmin } from '@/contexts/AdminContext';
import { adminTheme, adminStyles } from '@/utils/adminTheme';
import { AdminRole } from '@/types/admin';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showSocietySelector?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  customActions?: React.ReactNode;
  emergencyAlerts?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  showSocietySelector = true,
  showNotifications = true,
  showSearch = false,
  showMenu = false,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  onSettingsPress,
  customActions,
  emergencyAlerts = 0,
}) => {
  const { adminUser, activeSociety, availableSocieties, currentMode } =
    useAdmin();

  const [societySelectorOpen, setSocietySelectorOpen] = React.useState(false);

  const getRoleDisplayName = (role: AdminRole): string => {
    const roleNames = {
      super_admin: 'Super Admin',
      community_manager: 'Community Manager',
      financial_manager: 'Financial Manager',
      security_admin: 'Security Admin',
      maintenance_admin: 'Maintenance Admin',
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeColor = (role: AdminRole): string => {
    const roleColors = {
      super_admin: adminTheme.error,
      community_manager: adminTheme.primary,
      financial_manager: adminTheme.secondary,
      security_admin: adminTheme.warning,
      maintenance_admin: adminTheme.info,
    };
    return roleColors[role] || adminTheme.slate;
  };

  if (currentMode !== 'admin') {
    return null;
  }

  return (
    <View>
      <StatusBar
        backgroundColor={adminTheme.primary}
        barStyle="light-content"
      />

      <View style={[adminStyles.adminHeader, { paddingTop: 8 }]}>
        {/* Main header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* Left side */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {showMenu && (
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={onMenuPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Menu size={24} color={adminTheme.textInverse} />
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Shield size={20} color={adminTheme.secondary} />
                <Text
                  style={[
                    adminStyles.adminSubheading,
                    {
                      color: adminTheme.textInverse,
                      marginLeft: 8,
                      fontSize: 18,
                    },
                  ]}>
                  {title || 'Admin Panel'}
                </Text>
              </View>

              {subtitle && (
                <Text
                  style={[
                    adminStyles.adminCaption,
                    {
                      color: adminTheme.textInverse,
                      opacity: 0.8,
                      marginTop: 2,
                    },
                  ]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Right side actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {showSearch && (
              <TouchableOpacity
                onPress={onSearchPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Search size={20} color={adminTheme.textInverse} />
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                onPress={onNotificationPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ position: 'relative' }}>
                <Bell size={20} color={adminTheme.textInverse} />
                {emergencyAlerts > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: adminTheme.error,
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}>
                    <Text
                      style={{
                        color: adminTheme.textInverse,
                        fontSize: 10,
                        fontWeight: '700',
                      }}>
                      {emergencyAlerts > 9 ? '9+' : emergencyAlerts}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onSettingsPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Settings size={20} color={adminTheme.textInverse} />
            </TouchableOpacity>

            {customActions}
          </View>
        </View>

        {/* Admin role badge */}
        {adminUser && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
            }}>
            <View
              style={{
                backgroundColor: getRoleBadgeColor(adminUser.role),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={[
                  adminStyles.adminCaption,
                  {
                    color: adminTheme.textInverse,
                    fontWeight: '600',
                  },
                ]}>
                {getRoleDisplayName(adminUser.role)}
              </Text>
            </View>

            {/* Emergency alert indicator */}
            {emergencyAlerts > 0 && (
              <View
                style={{
                  backgroundColor: adminTheme.error,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <AlertTriangle size={12} color={adminTheme.textInverse} />
                <Text
                  style={[
                    adminStyles.adminCaption,
                    {
                      color: adminTheme.textInverse,
                      fontWeight: '700',
                      marginLeft: 4,
                    },
                  ]}>
                  {emergencyAlerts} EMERGENCY
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Society selector */}
        {showSocietySelector && availableSocieties.length > 1 && (
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: adminTheme.primaryLight,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setSocietySelectorOpen(!societySelectorOpen)}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    {
                      color: adminTheme.textInverse,
                      opacity: 0.8,
                    },
                  ]}>
                  Managing Society
                </Text>
                <Text
                  style={[
                    adminStyles.adminLabel,
                    {
                      color: adminTheme.textInverse,
                      marginTop: 2,
                    },
                  ]}>
                  {activeSociety?.name || 'Select Society'}
                </Text>
              </View>
              <ChevronDown
                size={16}
                color={adminTheme.textInverse}
                style={{
                  transform: [
                    { rotate: societySelectorOpen ? '180deg' : '0deg' },
                  ],
                }}
              />
            </TouchableOpacity>

            {/* Society dropdown */}
            {societySelectorOpen && (
              <View
                style={{
                  backgroundColor: adminTheme.surface,
                  borderRadius: 8,
                  marginTop: 4,
                  shadowColor: adminTheme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                {availableSocieties.map((society, index) => (
                  <TouchableOpacity
                    key={society.id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      borderBottomWidth:
                        index < availableSocieties.length - 1 ? 1 : 0,
                      borderBottomColor: adminTheme.borderLight,
                      backgroundColor:
                        society.id === activeSociety?.id
                          ? adminTheme.surfaceElevated
                          : 'transparent',
                    }}
                    onPress={() => {
                      console.log('Switch to society:', society.id);
                      setSocietySelectorOpen(false);
                    }}>
                    <Text
                      style={[
                        adminStyles.adminLabel,
                        {
                          color:
                            society.id === activeSociety?.id
                              ? adminTheme.primary
                              : adminTheme.textPrimary,
                          fontWeight:
                            society.id === activeSociety?.id ? '700' : '600',
                        },
                      ]}>
                      {society.name}
                    </Text>
                    <Text
                      style={[
                        adminStyles.adminCaption,
                        {
                          color: adminTheme.textTertiary,
                          marginTop: 2,
                        },
                      ]}>
                      {society.totalFlats} flats • {society.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Simplified admin header for sub-pages
export const SimpleAdminHeader: React.FC<{
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}> = ({ title, onBack, rightAction }) => {
  const { currentMode } = useAdmin();

  if (currentMode !== 'admin') {
    return null;
  }

  return (
    <View>
      <StatusBar
        backgroundColor={adminTheme.primary}
        barStyle="light-content"
      />

      <View style={[adminStyles.adminHeader, { paddingVertical: 16 }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {onBack && (
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={onBack}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ChevronDown
                  size={20}
                  color={adminTheme.textInverse}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={16} color={adminTheme.secondary} />
              <Text
                style={[
                  adminStyles.adminSubheading,
                  {
                    color: adminTheme.textInverse,
                    marginLeft: 8,
                  },
                ]}>
                {title}
              </Text>
            </View>
          </View>

          {rightAction}
        </View>
      </View>
    </View>
  );
};

export default AdminHeader;
