import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Shield, Home, ChevronDown } from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { adminTheme, adminStyles } from '@/utils/adminTheme';
import { AdminRole } from '@/types/admin';

interface ModeToggleProps {
  style?: any;
  showSocietySelector?: boolean;
  compact?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  style,
  showSocietySelector = true,
  compact = false,
}) => {
  const {
    currentMode,
    isAdmin,
    adminUser,
    activeSociety,
    availableSocieties,
    canSwitchMode,
    switchToAdminMode,
    switchToResidentMode,
    switchSociety,
  } = useDirectAdmin();

  const [societySelectorOpen, setSocietySelectorOpen] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleModeSwitch = async (mode: 'resident' | 'admin') => {
    if (currentMode === mode) return;

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (mode === 'admin') {
      const success = await switchToAdminMode();
      if (!success) {
        // Handle error - show alert or toast
        console.warn('Failed to switch to admin mode');
      }
    } else {
      switchToResidentMode();
    }
  };

  const handleSocietySwitch = async (societyId: string) => {
    try {
      await switchSociety(societyId);
      setSocietySelectorOpen(false);
    } catch (error) {
      console.error('Failed to switch society:', error);
    }
  };

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

  if (!isAdmin) {
    return null; // Don't show toggle if user is not an admin
  }

  if (compact) {
    return (
      <View style={[adminStyles.modeToggle, { width: 120 }, style]}>
        <TouchableOpacity
          style={[
            adminStyles.modeToggleOption,
            currentMode === 'resident' && adminStyles.modeToggleOptionActive,
          ]}
          onPress={() => handleModeSwitch('resident')}
          disabled={!canSwitchMode()}>
          <Home
            size={16}
            color={
              currentMode === 'resident'
                ? adminTheme.textOnPrimary
                : adminTheme.textSecondary
            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            adminStyles.modeToggleOption,
            currentMode === 'admin' && adminStyles.modeToggleOptionActive,
          ]}
          onPress={() => handleModeSwitch('admin')}
          disabled={!canSwitchMode()}>
          <Shield
            size={16}
            color={
              currentMode === 'admin'
                ? adminTheme.textOnPrimary
                : adminTheme.textSecondary
            }
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[{ minWidth: 200 }, style]}>
      {/* Main Mode Toggle */}
      <Animated.View
        style={[adminStyles.modeToggle, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            adminStyles.modeToggleOption,
            currentMode === 'resident' && adminStyles.modeToggleOptionActive,
          ]}
          onPress={() => handleModeSwitch('resident')}
          disabled={!canSwitchMode()}>
          <Home
            size={18}
            color={
              currentMode === 'resident'
                ? adminTheme.textOnPrimary
                : adminTheme.textSecondary
            }
          />
          <Text
            style={[
              adminStyles.adminLabel,
              {
                color:
                  currentMode === 'resident'
                    ? adminTheme.textOnPrimary
                    : adminTheme.textSecondary,
                fontSize: 12,
                marginTop: 2,
              },
            ]}>
            Resident
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            adminStyles.modeToggleOption,
            currentMode === 'admin' && adminStyles.modeToggleOptionActive,
          ]}
          onPress={() => handleModeSwitch('admin')}
          disabled={!canSwitchMode()}>
          <Shield
            size={18}
            color={
              currentMode === 'admin'
                ? adminTheme.textOnPrimary
                : adminTheme.textSecondary
            }
          />
          <Text
            style={[
              adminStyles.adminLabel,
              {
                color:
                  currentMode === 'admin'
                    ? adminTheme.textOnPrimary
                    : adminTheme.textSecondary,
                fontSize: 12,
                marginTop: 2,
              },
            ]}>
            Admin
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Admin Role Badge */}
      {currentMode === 'admin' && adminUser && (
        <View
          style={{
            backgroundColor: getRoleBadgeColor(adminUser.role),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 8,
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
      )}

      {/* Society Selector (for admin mode with multiple societies) */}
      {currentMode === 'admin' &&
        showSocietySelector &&
        availableSocieties.length > 1 && (
          <View style={{ marginTop: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: adminTheme.surfaceElevated,
                borderWidth: 1,
                borderColor: adminTheme.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setSocietySelectorOpen(!societySelectorOpen)}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    adminStyles.adminCaption,
                    { color: adminTheme.textTertiary },
                  ]}>
                  Active Society
                </Text>
                <Text
                  style={[
                    adminStyles.adminBody,
                    {
                      color: adminTheme.textPrimary,
                      fontSize: 14,
                      marginTop: 2,
                    },
                  ]}>
                  {activeSociety?.name || 'Select Society'}
                </Text>
              </View>
              <ChevronDown
                size={16}
                color={adminTheme.textSecondary}
                style={{
                  transform: [
                    { rotate: societySelectorOpen ? '180deg' : '0deg' },
                  ],
                }}
              />
            </TouchableOpacity>

            {/* Society Dropdown */}
            {societySelectorOpen && (
              <View
                style={{
                  backgroundColor: adminTheme.surface,
                  borderWidth: 1,
                  borderColor: adminTheme.border,
                  borderRadius: 8,
                  marginTop: 4,
                  shadowColor: adminTheme.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 4,
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
                    onPress={() => handleSocietySwitch(society.id)}>
                    <Text
                      style={[
                        adminStyles.adminBody,
                        {
                          color:
                            society.id === activeSociety?.id
                              ? adminTheme.primary
                              : adminTheme.textPrimary,
                          fontSize: 14,
                          fontWeight:
                            society.id === activeSociety?.id ? '600' : '500',
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
  );
};

// Simplified header mode indicator
export const HeaderModeIndicator: React.FC<{ compact?: boolean }> = ({
  compact = true,
}) => {
  const { currentMode, isAdmin, adminUser } = useDirectAdmin();

  if (!isAdmin || currentMode === 'resident') {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: adminTheme.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Shield size={12} color={adminTheme.textOnSecondary} />
      {!compact && (
        <Text
          style={[
            adminStyles.adminCaption,
            {
              color: adminTheme.textOnSecondary,
              marginLeft: 4,
              fontWeight: '600',
            },
          ]}>
          Admin Mode
        </Text>
      )}
    </View>
  );
};

export default ModeToggle;
