import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/utils/cn';

export interface VisitorStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'expired' | 'scheduled' | 'inside' | 'overstay' | 'emergency' | 'blocked';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Visitor Status Badge Component
 * 
 * Features:
 * - Consistent status visualization
 * - Color-coded status indicators
 * - Multiple size variants
 * - Security-specific status types
 */
const VisitorStatusBadge: React.FC<VisitorStatusBadgeProps> = ({
  status,
  size = 'md',
  className
}) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Pending'
        };
      case 'approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Approved'
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Rejected'
        };
      case 'checked_in':
      case 'inside':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Inside'
        };
      case 'checked_out':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Checked Out'
        };
      case 'expired':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Expired'
        };
      case 'scheduled':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          label: 'Scheduled'
        };
      case 'overstay':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Overstaying'
        };
      case 'emergency':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Emergency'
        };
      case 'blocked':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Blocked'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const styles = getStatusStyles(status);

  return (
    <View 
      className={cn(
        'rounded-full items-center justify-center',
        styles.bg,
        sizeClasses[size],
        className
      )}
    >
      <Text className={cn('font-medium', styles.text)}>
        {styles.label}
      </Text>
    </View>
  );
};

VisitorStatusBadge.displayName = 'VisitorStatusBadge';

export default VisitorStatusBadge;