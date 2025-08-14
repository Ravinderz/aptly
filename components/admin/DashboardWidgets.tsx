import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Users,
  DollarSign,
  Bell,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { adminTheme, adminStyles } from '@/utils/adminTheme';

// Generic stat widget with trend indicator
interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = adminTheme.primary,
  onPress,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={16} color={adminTheme.success} />;
      case 'down':
        return <TrendingDown size={16} color={adminTheme.error} />;
      default:
        return <Minus size={16} color={adminTheme.slate} />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return adminTheme.textTertiary;

    switch (trend.direction) {
      case 'up':
        return adminTheme.success;
      case 'down':
        return adminTheme.error;
      default:
        return adminTheme.slate;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[adminStyles.adminCard, { flex: 1, minWidth: '47%' }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[adminStyles.adminCaption, { flex: 1 }]}>{title}</Text>
          </View>

          <Text style={[adminStyles.adminHeading, { fontSize: 24, color }]}>
            {value}
          </Text>

          {subtitle && (
            <Text
              style={[
                adminStyles.adminCaption,
                { color: adminTheme.textTertiary, marginTop: 2 },
              ]}>
              {subtitle}
            </Text>
          )}

          {trend && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}>
              {getTrendIcon()}
              <Text
                style={[
                  adminStyles.adminCaption,
                  {
                    color: getTrendColor(),
                    marginLeft: 4,
                    fontWeight: '600',
                  },
                ]}>
                {trend.percentage > 0 ? '+' : ''}
                {trend.percentage}%
              </Text>
            </View>
          )}
        </View>

        {onPress && <ChevronRight size={16} color={adminTheme.textTertiary} />}
      </View>
    </Component>
  );
};

// Progress widget for tracking completion rates
interface ProgressWidgetProps {
  title: string;
  completed: number;
  total: number;
  color?: string;
  showDetails?: boolean;
  details?: {
    label: string;
    value: number;
    color: string;
  }[];
  onPress?: () => void;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  completed,
  total,
  color = adminTheme.primary,
  showDetails = false,
  details = [],
  onPress,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={adminStyles.adminCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <Text style={adminStyles.adminSubheading}>{title}</Text>
        <Text
          style={[adminStyles.adminBody, { color: adminTheme.textSecondary }]}>
          {completed}/{total}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          backgroundColor: adminTheme.surfaceElevated,
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: showDetails ? 16 : 0,
        }}>
        <View
          style={{
            backgroundColor: color,
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </View>

      {/* Details breakdown */}
      {showDetails && details.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {details.map((detail, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              <Text
                style={[
                  adminStyles.adminHeading,
                  { color: detail.color, fontSize: 16 },
                ]}>
                {detail.value}
              </Text>
              <Text style={[adminStyles.adminCaption, { textAlign: 'center' }]}>
                {detail.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {onPress && (
        <View style={{ position: 'absolute', top: 16, right: 16 }}>
          <ChevronRight size={16} color={adminTheme.textTertiary} />
        </View>
      )}
    </Component>
  );
};

// Quick action button widget
interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
  subtitle?: string;
  badge?: number;
}

export const QuickActionWidget: React.FC<QuickActionProps> = ({
  title,
  icon,
  onPress,
  color = adminTheme.primary,
  subtitle,
  badge,
}) => {
  return (
    <TouchableOpacity
      style={[
        adminStyles.adminCard,
        {
          backgroundColor: color,
          flex: 1,
          minWidth: '47%',
          paddingVertical: 20,
          position: 'relative',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: adminTheme.error,
            borderRadius: 12,
            minWidth: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 8,
          }}>
          <Text
            style={[
              adminStyles.adminCaption,
              {
                color: adminTheme.textInverse,
                fontWeight: '700',
                fontSize: 12,
              },
            ]}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}

      <View style={{ alignItems: 'center' }}>
        {icon}
        <Text
          style={[
            adminStyles.adminLabel,
            {
              color: adminTheme.textOnPrimary,
              marginTop: 8,
              textAlign: 'center',
              fontWeight: '600',
            },
          ]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              adminStyles.adminCaption,
              {
                color: adminTheme.textOnPrimary,
                opacity: 0.8,
                marginTop: 2,
                textAlign: 'center',
              },
            ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Alert/notification widget
interface AlertWidgetProps {
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp?: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({
  type,
  title,
  message,
  timestamp,
  onPress,
  onDismiss,
}) => {
  const getAlertColor = () => {
    switch (type) {
      case 'emergency':
        return adminTheme.error;
      case 'warning':
        return adminTheme.warning;
      case 'success':
        return adminTheme.success;
      default:
        return adminTheme.info;
    }
  };

  const getAlertIcon = () => {
    const color = getAlertColor();

    switch (type) {
      case 'emergency':
      case 'warning':
        return <AlertCircle size={20} color={color} />;
      case 'success':
        return <CheckCircle size={20} color={color} />;
      default:
        return <Bell size={20} color={color} />;
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        adminStyles.adminCard,
        {
          borderLeftWidth: 4,
          borderLeftColor: getAlertColor(),
          backgroundColor:
            type === 'emergency' ? adminTheme.error + '08' : adminTheme.surface,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ marginRight: 12 }}>{getAlertIcon()}</View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              adminStyles.adminLabel,
              { color: getAlertColor(), fontWeight: '700' },
            ]}>
            {title}
          </Text>
          <Text style={[adminStyles.adminBody, { marginTop: 4 }]}>
            {message}
          </Text>
          {timestamp && (
            <Text style={[adminStyles.adminCaption, { marginTop: 4 }]}>
              {timestamp}
            </Text>
          )}
        </View>

        {onDismiss && (
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text
              style={[
                adminStyles.adminCaption,
                { color: adminTheme.textTertiary },
              ]}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Component>
  );
};

// Summary card for important metrics
interface SummaryCardProps {
  title: string;
  metrics: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  onPress?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  metrics,
  onPress,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={adminStyles.adminCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <Text style={adminStyles.adminSubheading}>{title}</Text>
        {onPress && <ChevronRight size={16} color={adminTheme.textTertiary} />}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {metrics.map((metric, index) => (
          <View key={index} style={{ alignItems: 'center', minWidth: 60 }}>
            <Text
              style={[
                adminStyles.adminHeading,
                {
                  fontSize: 20,
                  color: metric.color || adminTheme.textPrimary,
                },
              ]}>
              {metric.value}
            </Text>
            <Text style={[adminStyles.adminCaption, { textAlign: 'center' }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>
    </Component>
  );
};

// Multi-society comparison widget
interface MultiSocietyComparisonProps {
  title: string;
  societies: {
    id: string;
    name: string;
    value: number;
    change?: number;
    color?: string;
  }[];
  unit?: string;
  showTrend?: boolean;
  onSocietyPress?: (societyId: string) => void;
}

export const MultiSocietyComparison: React.FC<MultiSocietyComparisonProps> = ({
  title,
  societies,
  unit = '',
  showTrend = true,
  onSocietyPress,
}) => {
  const maxValue = societies?.length > 0 ? Math.max(...societies.map((s) => s?.value || 0)) : 0;

  return (
    <View style={adminStyles.adminCard}>
      <Text style={[adminStyles.adminSubheading, { marginBottom: 16 }]}>
        {title}
      </Text>

      <View style={{ gap: 12 }}>
        {(societies || []).map((society) => {
          const percentage =
            maxValue > 0 ? ((society?.value || 0) / maxValue) * 100 : 0;
          const Component = onSocietyPress ? TouchableOpacity : View;

          return (
            <Component
              key={society?.id || Math.random()}
              onPress={() => onSocietyPress?.(society?.id)}
              activeOpacity={onSocietyPress ? 0.7 : 1}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                <Text
                  style={[adminStyles.adminBody, { flex: 1 }]}
                  numberOfLines={1}>
                  {society?.name || 'Unknown Society'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={[
                      adminStyles.adminLabel,
                      {
                        color: society?.color || adminTheme.textPrimary,
                        fontWeight: '600',
                      },
                    ]}>
                    {society?.value || 0}
                    {unit}
                  </Text>
                  {showTrend && society?.change !== undefined && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 8,
                      }}>
                      {(society?.change || 0) > 0 ? (
                        <TrendingUp size={12} color={adminTheme.success} />
                      ) : (society?.change || 0) < 0 ? (
                        <TrendingDown size={12} color={adminTheme.error} />
                      ) : (
                        <Minus size={12} color={adminTheme.slate} />
                      )}
                      <Text
                        style={[
                          adminStyles.adminCaption,
                          {
                            color:
                              (society?.change || 0) > 0
                                ? adminTheme.success
                                : (society?.change || 0) < 0
                                  ? adminTheme.error
                                  : adminTheme.slate,
                            marginLeft: 2,
                            fontSize: 11,
                          },
                        ]}>
                        {(society?.change || 0) > 0 ? '+' : ''}
                        {society?.change || 0}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Progress bar */}
              <View
                style={{
                  backgroundColor: adminTheme.surfaceElevated,
                  height: 6,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    backgroundColor: society?.color || adminTheme.primary,
                    height: '100%',
                    width: `${Math.min(percentage, 100)}%`,
                  }}
                />
              </View>
            </Component>
          );
        })}
      </View>
    </View>
  );
};

// Society selector widget
interface SocietySelectorWidgetProps {
  currentSociety: {
    id: string;
    name: string;
    code: string;
    activeUsers: number;
    totalUsers: number;
  };
  availableSocieties: number;
  onSwitchPress: () => void;
}

export const SocietySelectorWidget: React.FC<SocietySelectorWidgetProps> = ({
  currentSociety,
  availableSocieties,
  onSwitchPress,
}) => {
  const occupancyRate =
    (currentSociety?.totalUsers || 0) > 0
      ? ((currentSociety?.activeUsers || 0) / (currentSociety?.totalUsers || 1)) * 100
      : 0;

  return (
    <TouchableOpacity
      style={adminStyles.adminCard}
      onPress={onSwitchPress}
      activeOpacity={0.8}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              adminStyles.adminCaption,
              { color: adminTheme.textSecondary },
            ]}>
            Current Society
          </Text>
          <Text style={[adminStyles.adminSubheading, { marginBottom: 4 }]}>
            {currentSociety?.name || 'Unknown Society'}
          </Text>
          <Text
            style={[
              adminStyles.adminCaption,
              { color: adminTheme.textTertiary },
            ]}>
            {currentSociety?.code || 'N/A'}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              adminStyles.adminCaption,
              { color: adminTheme.textSecondary },
            ]}>
            Available: {availableSocieties}
          </Text>
          <ChevronRight
            size={16}
            color={adminTheme.textTertiary}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text
          style={[adminStyles.adminBody, { color: adminTheme.textSecondary }]}>
          Occupancy Rate
        </Text>
        <Text
          style={[
            adminStyles.adminLabel,
            {
              color:
                occupancyRate > 80
                  ? adminTheme.success
                  : occupancyRate > 60
                    ? adminTheme.warning
                    : adminTheme.error,
              fontWeight: '600',
            },
          ]}>
          {occupancyRate.toFixed(1)}%
        </Text>
      </View>

      <View
        style={{
          backgroundColor: adminTheme.surfaceElevated,
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          marginTop: 8,
        }}>
        <View
          style={{
            backgroundColor:
              occupancyRate > 80
                ? adminTheme.success
                : occupancyRate > 60
                  ? adminTheme.warning
                  : adminTheme.error,
            height: '100%',
            width: `${Math.min(occupancyRate, 100)}%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

// Cross-society alert widget
interface CrossSocietyAlertProps {
  alerts: {
    id: string;
    type: 'system' | 'billing' | 'security' | 'maintenance';
    title: string;
    affectedSocieties: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }[];
  onViewAll?: () => void;
}

export const CrossSocietyAlert: React.FC<CrossSocietyAlertProps> = ({
  alerts,
  onViewAll,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return adminTheme.error;
      case 'high':
        return adminTheme.warning;
      case 'medium':
        return adminTheme.info;
      default:
        return adminTheme.textSecondary;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <View style={adminStyles.adminCard}>
        <View style={{ alignItems: 'center', padding: 16 }}>
          <CheckCircle size={32} color={adminTheme.success} />
          <Text
            style={[
              adminStyles.adminLabel,
              {
                color: adminTheme.success,
                marginTop: 8,
                textAlign: 'center',
              },
            ]}>
            All Systems Normal
          </Text>
          <Text
            style={[
              adminStyles.adminCaption,
              {
                color: adminTheme.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              },
            ]}>
            No cross-society alerts
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={adminStyles.adminCard}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <Text style={adminStyles.adminSubheading}>Platform Alerts</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text
              style={[adminStyles.adminCaption, { color: adminTheme.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ gap: 12 }}>
        {(alerts || []).slice(0, 3).map((alert) => (
          <View
            key={alert?.id || Math.random()}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: 12,
              backgroundColor: adminTheme.surfaceElevated,
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: getSeverityColor(alert?.severity || 'low'),
            }}>
            <AlertCircle
              size={16}
              color={getSeverityColor(alert?.severity || 'low')}
              style={{ marginRight: 8, marginTop: 2 }}
            />

            <View style={{ flex: 1 }}>
              <Text style={[adminStyles.adminLabel, { fontWeight: '600' }]}>
                {alert?.title || 'Unknown Alert'}
              </Text>
              <Text
                style={[
                  adminStyles.adminCaption,
                  {
                    color: adminTheme.textSecondary,
                    marginTop: 2,
                  },
                ]}>
                Affects {alert?.affectedSocieties || 0}{' '}
                {(alert?.affectedSocieties || 0) === 1 ? 'society' : 'societies'} •{' '}
                {(alert?.severity || 'low').toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Multi-society performance widget
interface PerformanceMetric {
  label: string;
  societies: {
    id: string;
    name: string;
    value: number;
    target?: number;
  }[];
  unit?: string;
  type: 'percentage' | 'currency' | 'number';
}

interface MultiSocietyPerformanceProps {
  title: string;
  metrics: PerformanceMetric[];
  timeframe: string;
  onDetailPress?: () => void;
}

export const MultiSocietyPerformance: React.FC<
  MultiSocietyPerformanceProps
> = ({ title, metrics, timeframe, onDetailPress }) => {
  const formatValue = (value: number, type: string, unit?: string) => {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `₹${(value / 100000).toFixed(1)}L`;
      case 'number':
        return `${value}${unit || ''}`;
      default:
        return `${value}`;
    }
  };

  return (
    <View style={adminStyles.adminCard}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
        <View>
          <Text style={adminStyles.adminSubheading}>{title}</Text>
          <Text
            style={[
              adminStyles.adminCaption,
              { color: adminTheme.textSecondary },
            ]}>
            {timeframe}
          </Text>
        </View>
        {onDetailPress && (
          <TouchableOpacity onPress={onDetailPress}>
            <ChevronRight size={16} color={adminTheme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ gap: 16 }}>
        {(metrics || []).map((metric, index) => (
          <View key={index}>
            <Text
              style={[
                adminStyles.adminLabel,
                {
                  color: adminTheme.textSecondary,
                  marginBottom: 8,
                },
              ]}>
              {metric?.label || 'Unknown Metric'}
            </Text>

            <View style={{ gap: 6 }}>
              {(metric?.societies || []).map((society) => {
                const achievement = society?.target
                  ? ((society?.value || 0) / society.target) * 100
                  : 100;

                return (
                  <View
                    key={society?.id || Math.random()}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={[adminStyles.adminBody, { flex: 1 }]}
                      numberOfLines={1}>
                      {society?.name || 'Unknown Society'}
                    </Text>

                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={[
                          adminStyles.adminLabel,
                          {
                            color:
                              achievement >= 100
                                ? adminTheme.success
                                : achievement >= 80
                                  ? adminTheme.warning
                                  : adminTheme.error,
                            fontWeight: '600',
                            minWidth: 60,
                            textAlign: 'right',
                          },
                        ]}>
                        {formatValue(society?.value || 0, metric?.type || 'number', metric?.unit)}
                      </Text>

                      {society?.target && (
                        <Text
                          style={[
                            adminStyles.adminCaption,
                            {
                              color: adminTheme.textTertiary,
                              marginLeft: 4,
                            },
                          ]}>
                          /{' '}
                          {formatValue(
                            society?.target || 0,
                            metric?.type || 'number',
                            metric?.unit,
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default {
  StatWidget,
  ProgressWidget,
  QuickActionWidget,
  AlertWidget,
  SummaryCard,
  MultiSocietyComparison,
  SocietySelectorWidget,
  CrossSocietyAlert,
  MultiSocietyPerformance,
};
