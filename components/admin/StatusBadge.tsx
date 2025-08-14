import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/utils/cn';

export interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'suspended' | 'under_review';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * StatusBadge Component
 * 
 * A reusable badge component for displaying various status states
 * with appropriate colors and styling.
 * 
 * @param status - The status to display
 * @param size - Size variant (sm, md, lg)
 * @param className - Additional CSS classes
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  className 
}) => {
  const getStatusStyles = (status: string) => {
    const styles = {
      // Society onboarding statuses
      pending: {
        container: 'bg-yellow-100 border-yellow-200',
        text: 'text-yellow-800'
      },
      under_review: {
        container: 'bg-blue-100 border-blue-200',
        text: 'text-blue-800'
      },
      approved: {
        container: 'bg-green-100 border-green-200',
        text: 'text-green-800'
      },
      rejected: {
        container: 'bg-red-100 border-red-200',
        text: 'text-red-800'
      },
      
      // Society operational statuses
      active: {
        container: 'bg-green-100 border-green-200',
        text: 'text-green-800'
      },
      inactive: {
        container: 'bg-gray-100 border-gray-200',
        text: 'text-gray-800'
      },
      suspended: {
        container: 'bg-red-100 border-red-200',
        text: 'text-red-800'
      },
    };
    
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getSizeStyles = (size: string) => {
    const styles = {
      sm: {
        container: 'px-2 py-1',
        text: 'text-xs'
      },
      md: {
        container: 'px-3 py-1',
        text: 'text-sm'
      },
      lg: {
        container: 'px-4 py-2',
        text: 'text-base'
      }
    };
    
    return styles[size as keyof typeof styles] || styles.md;
  };

  const statusStyles = getStatusStyles(status);
  const sizeStyles = getSizeStyles(size);

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
    };
    
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <View 
      className={cn(
        'rounded-full border inline-flex items-center justify-center',
        statusStyles.container,
        sizeStyles.container,
        className
      )}
    >
      <Text 
        className={cn(
          'font-medium capitalize',
          statusStyles.text,
          sizeStyles.text
        )}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
};

export default StatusBadge;