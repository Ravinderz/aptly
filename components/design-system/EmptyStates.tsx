import React from 'react';
import { View, Text } from 'react-native';
import {
  Inbox,
  Search,
  Users,
  Building2,
  FileText,
  Bell,
  Car,
  Calendar,
  MessageCircle,
  Settings,
  Shield,
  UserPlus,
  Plus,
  Archive,
  Filter,
  Database,
  Wifi,
  Clock,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

interface BaseEmptyStateProps {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
}

interface EmptyStateProps extends BaseEmptyStateProps {
  icon?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'illustration';
}

interface EmptyStateCardProps extends BaseEmptyStateProps {
  icon?: React.ReactNode;
}

interface EmptyStatePageProps extends BaseEmptyStateProps {
  icon?: React.ReactNode;
}

/**
 * EmptyState - Basic empty state component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions = [],
  variant = 'default',
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return {
          container: 'py-8',
          titleColor: 'text-gray-700',
          descriptionColor: 'text-gray-500',
          iconOpacity: 0.6,
        };
      case 'illustration':
        return {
          container: 'py-12',
          titleColor: 'text-gray-900',
          descriptionColor: 'text-gray-600',
          iconOpacity: 0.8,
        };
      default:
        return {
          container: 'py-10',
          titleColor: 'text-gray-900',
          descriptionColor: 'text-gray-600',
          iconOpacity: 0.7,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <View className={cn('items-center text-center px-4', styles.container, className)}>
      {icon && (
        <View className="mb-4" style={{ opacity: styles.iconOpacity }}>
          {icon}
        </View>
      )}
      
      <Text className={cn('text-lg font-semibold mb-2 text-center', styles.titleColor)}>
        {title}
      </Text>
      
      <Text className={cn('text-sm text-center mb-6 leading-relaxed max-w-sm', styles.descriptionColor)}>
        {description}
      </Text>
      
      {actions.length > 0 && (
        <View className="flex-row flex-wrap justify-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onPress={action.onPress}
              variant={action.variant || 'primary'}
              size="sm"
            >
              <View className="flex-row items-center">
                {action.icon && (
                  <View className="mr-2">
                    {action.icon}
                  </View>
                )}
                <Text>{action.label}</Text>
              </View>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * EmptyStateCard - Empty state in card format
 */
export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  actions = [],
  className,
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        actions={actions}
        variant="default"
      />
    </Card>
  );
};

/**
 * EmptyStatePage - Full page empty state
 */
export const EmptyStatePage: React.FC<EmptyStatePageProps> = ({
  icon,
  title,
  description,
  actions = [],
  className,
}) => {
  return (
    <View className={cn('flex-1 items-center justify-center bg-gray-50 px-6', className)}>
      <View className="items-center max-w-sm">
        {icon && (
          <View className="mb-6" style={{ opacity: 0.7 }}>
            {icon}
          </View>
        )}
        
        <Text className="text-2xl font-bold mb-4 text-center text-gray-900">
          {title}
        </Text>
        
        <Text className="text-base text-center mb-8 leading-relaxed text-gray-600">
          {description}
        </Text>
        
        {actions.length > 0 && (
          <View className="w-full space-y-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onPress={action.onPress}
                variant={action.variant || 'primary'}
                className="w-full"
              >
                <View className="flex-row items-center justify-center">
                  {action.icon && (
                    <View className="mr-2">
                      {action.icon}
                    </View>
                  )}
                  <Text>{action.label}</Text>
                </View>
              </Button>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Predefined Empty State Components for Common Scenarios
 */

// No Search Results
export const NoSearchResults: React.FC<{
  query?: string;
  onClear?: () => void;
  onTryAgain?: () => void;
  className?: string;
}> = ({ query, onClear, onTryAgain, className }) => {
  const actions: EmptyStateAction[] = [];
  
  if (onClear) {
    actions.push({
      label: 'Clear Search',
      onPress: onClear,
      variant: 'outline',
      icon: <Search size={16} color="currentColor" />
    });
  }
  
  if (onTryAgain) {
    actions.push({
      label: 'Try Again',
      onPress: onTryAgain,
      variant: 'primary'
    });
  }

  return (
    <EmptyState
      icon={<Search size={48} color="#6b7280" />}
      title="No results found"
      description={query ? `No results found for "${query}". Try adjusting your search terms.` : "We couldn't find anything matching your search."}
      actions={actions}
      className={className}
    />
  );
};

// No Data Yet
export const NoDataYet: React.FC<{
  entityName: string;
  onAdd?: () => void;
  className?: string;
}> = ({ entityName, onAdd, className }) => (
  <EmptyState
    icon={<Database size={48} color="#6b7280" />}
    title={`No ${entityName} yet`}
    description={`You haven't added any ${entityName} yet. Get started by creating your first one.`}
    actions={onAdd ? [{
      label: `Add ${entityName}`,
      onPress: onAdd,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Notifications
export const NoNotifications: React.FC<{
  className?: string;
}> = ({ className }) => (
  <EmptyState
    icon={<Bell size={48} color="#6b7280" />}
    title="No notifications"
    description="You're all caught up! New notifications will appear here when they arrive."
    className={className}
  />
);

// No Messages
export const NoMessages: React.FC<{
  onStartConversation?: () => void;
  className?: string;
}> = ({ onStartConversation, className }) => (
  <EmptyState
    icon={<MessageCircle size={48} color="#6b7280" />}
    title="No messages yet"
    description="Start a conversation to connect with your community members."
    actions={onStartConversation ? [{
      label: 'Start Conversation',
      onPress: onStartConversation,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Users/Members
export const NoMembers: React.FC<{
  memberType?: string;
  onInvite?: () => void;
  className?: string;
}> = ({ memberType = "members", onInvite, className }) => (
  <EmptyState
    icon={<Users size={48} color="#6b7280" />}
    title={`No ${memberType} yet`}
    description={`No ${memberType} have joined yet. Invite them to get started.`}
    actions={onInvite ? [{
      label: `Invite ${memberType}`,
      onPress: onInvite,
      variant: 'primary',
      icon: <UserPlus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Societies
export const NoSocieties: React.FC<{
  onAdd?: () => void;
  className?: string;
}> = ({ onAdd, className }) => (
  <EmptyState
    icon={<Building2 size={48} color="#6b7280" />}
    title="No societies yet"
    description="Start by adding your first society to manage its operations and residents."
    actions={onAdd ? [{
      label: 'Add Society',
      onPress: onAdd,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Vehicles
export const NoVehicles: React.FC<{
  onAdd?: () => void;
  className?: string;
}> = ({ onAdd, className }) => (
  <EmptyState
    icon={<Car size={48} color="#6b7280" />}
    title="No vehicles registered"
    description="Add your vehicles to enable security tracking and parking management."
    actions={onAdd ? [{
      label: 'Add Vehicle',
      onPress: onAdd,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Events
export const NoEvents: React.FC<{
  onAdd?: () => void;
  className?: string;
}> = ({ onAdd, className }) => (
  <EmptyState
    icon={<Calendar size={48} color="#6b7280" />}
    title="No events scheduled"
    description="Keep your community engaged by organizing events and activities."
    actions={onAdd ? [{
      label: 'Create Event',
      onPress: onAdd,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// No Documents
export const NoDocuments: React.FC<{
  onUpload?: () => void;
  className?: string;
}> = ({ onUpload, className }) => (
  <EmptyState
    icon={<FileText size={48} color="#6b7280" />}
    title="No documents found"
    description="Upload important documents to keep them organized and accessible."
    actions={onUpload ? [{
      label: 'Upload Document',
      onPress: onUpload,
      variant: 'primary',
      icon: <Plus size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// Coming Soon
export const ComingSoon: React.FC<{
  featureName: string;
  description?: string;
  className?: string;
}> = ({ featureName, description, className }) => (
  <EmptyState
    icon={<Clock size={48} color="#6b7280" />}
    title={`${featureName} Coming Soon`}
    description={description || "We're working on this feature. Stay tuned for updates!"}
    variant="subtle"
    className={className}
  />
);

// Under Construction
export const UnderConstruction: React.FC<{
  className?: string;
}> = ({ className }) => (
  <EmptyState
    icon={<Settings size={48} color="#6b7280" />}
    title="Under Construction"
    description="This section is being improved. Please check back later for new features."
    variant="subtle"
    className={className}
  />
);

// No Connection
export const NoConnection: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <EmptyState
    icon={<Wifi size={48} color="#6b7280" />}
    title="No Internet Connection"
    description="Please check your connection and try again."
    actions={onRetry ? [{
      label: 'Retry',
      onPress: onRetry,
      variant: 'primary'
    }] : []}
    className={className}
  />
);

// Permission Denied
export const PermissionDenied: React.FC<{
  resource?: string;
  onRequestAccess?: () => void;
  className?: string;
}> = ({ resource = "this content", onRequestAccess, className }) => (
  <EmptyState
    icon={<Shield size={48} color="#6b7280" />}
    title="Access Denied"
    description={`You don't have permission to access ${resource}. Contact your administrator for access.`}
    actions={onRequestAccess ? [{
      label: 'Request Access',
      onPress: onRequestAccess,
      variant: 'primary'
    }] : []}
    className={className}
  />
);

// Archived Content
export const ArchivedContent: React.FC<{
  contentType?: string;
  className?: string;
}> = ({ contentType = "content", className }) => (
  <EmptyState
    icon={<Archive size={48} color="#6b7280" />}
    title={`${contentType} Archived`}
    description={`This ${contentType} has been archived and is no longer active.`}
    variant="subtle"
    className={className}
  />
);

// Export all components
export default {
  EmptyState,
  EmptyStateCard,
  EmptyStatePage,
  NoSearchResults,
  NoDataYet,
  NoNotifications,
  NoMessages,
  NoMembers,
  NoSocieties,
  NoVehicles,
  NoEvents,
  NoDocuments,
  ComingSoon,
  UnderConstruction,
  NoConnection,
  PermissionDenied,
  ArchivedContent,
};

// Add display names
EmptyState.displayName = 'EmptyState';
EmptyStateCard.displayName = 'EmptyStateCard';
EmptyStatePage.displayName = 'EmptyStatePage';
NoSearchResults.displayName = 'NoSearchResults';
NoDataYet.displayName = 'NoDataYet';
NoNotifications.displayName = 'NoNotifications';
NoMessages.displayName = 'NoMessages';
NoMembers.displayName = 'NoMembers';
NoSocieties.displayName = 'NoSocieties';
NoVehicles.displayName = 'NoVehicles';
NoEvents.displayName = 'NoEvents';
NoDocuments.displayName = 'NoDocuments';
ComingSoon.displayName = 'ComingSoon';
UnderConstruction.displayName = 'UnderConstruction';
NoConnection.displayName = 'NoConnection';
PermissionDenied.displayName = 'PermissionDenied';
ArchivedContent.displayName = 'ArchivedContent';