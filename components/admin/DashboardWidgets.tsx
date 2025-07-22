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
  CheckCircle
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
  onPress
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
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            {icon && (
              <View style={{ marginRight: 8 }}>
                {icon}
              </View>
            )}
            <Text style={[adminStyles.adminCaption, { flex: 1 }]}>
              {title}
            </Text>
          </View>
          
          <Text style={[adminStyles.adminHeading, { fontSize: 24, color }]}>
            {value}
          </Text>
          
          {subtitle && (
            <Text style={[adminStyles.adminCaption, { color: adminTheme.textTertiary, marginTop: 2 }]}>
              {subtitle}
            </Text>
          )}
          
          {trend && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {getTrendIcon()}
              <Text style={[adminStyles.adminCaption, { 
                color: getTrendColor(),
                marginLeft: 4,
                fontWeight: '600'
              }]}>
                {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
              </Text>
            </View>
          )}
        </View>
        
        {onPress && (
          <ChevronRight size={16} color={adminTheme.textTertiary} />
        )}
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
  onPress
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={adminStyles.adminCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={adminStyles.adminSubheading}>
          {title}
        </Text>
        <Text style={[adminStyles.adminBody, { color: adminTheme.textSecondary }]}>
          {completed}/{total}
        </Text>
      </View>
      
      {/* Progress bar */}
      <View style={{ 
        backgroundColor: adminTheme.surfaceElevated,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: showDetails ? 16 : 0
      }}>
        <View style={{
          backgroundColor: color,
          height: '100%',
          width: `${Math.min(percentage, 100)}%`
        }} />
      </View>
      
      {/* Details breakdown */}
      {showDetails && details.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {details.map((detail, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[adminStyles.adminHeading, { color: detail.color, fontSize: 16 }]}>
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
  badge
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
          position: 'relative'
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <View style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: adminTheme.error,
          borderRadius: 12,
          minWidth: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 8
        }}>
          <Text style={[adminStyles.adminCaption, { 
            color: adminTheme.textInverse,
            fontWeight: '700',
            fontSize: 12
          }]}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
      
      <View style={{ alignItems: 'center' }}>
        {icon}
        <Text style={[
          adminStyles.adminLabel,
          { 
            color: adminTheme.textOnPrimary,
            marginTop: 8,
            textAlign: 'center',
            fontWeight: '600'
          }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            adminStyles.adminCaption,
            { 
              color: adminTheme.textOnPrimary,
              opacity: 0.8,
              marginTop: 2,
              textAlign: 'center'
            }
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
  onDismiss
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
          backgroundColor: type === 'emergency' ? adminTheme.error + '08' : adminTheme.surface
        }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ marginRight: 12 }}>
          {getAlertIcon()}
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[adminStyles.adminLabel, { color: getAlertColor(), fontWeight: '700' }]}>
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[adminStyles.adminCaption, { color: adminTheme.textTertiary }]}>
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
  onPress
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={adminStyles.adminCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={adminStyles.adminSubheading}>
          {title}
        </Text>
        {onPress && (
          <ChevronRight size={16} color={adminTheme.textTertiary} />
        )}
      </View>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {metrics.map((metric, index) => (
          <View key={index} style={{ alignItems: 'center', minWidth: 60 }}>
            <Text style={[
              adminStyles.adminHeading, 
              { 
                fontSize: 20,
                color: metric.color || adminTheme.textPrimary
              }
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

export default {
  StatWidget,
  ProgressWidget,
  QuickActionWidget,
  AlertWidget,
  SummaryCard
};