import { cn } from '@/utils/cn';
import {
  Bug,
  Cog,
  CreditCard,
  Hammer,
  Package,
  PackageOpen,
  PaintRoller,
  Router,
  Sparkles,
  Sprout,
  Wrench,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

// Define props interface
interface ServiceTileProps {
  iconName: string;
  serviceName: string;
  testID?: string;
}

// Styled components for NativeWind

const ServiceTile: React.FC<ServiceTileProps> = ({
  iconName,
  serviceName,
  testID,
}) => {
  // Dynamically import the icon based on the iconName prop

  const IconMap = {
    Sparkles: <Sparkles color="#6366f1" size={28} />,
    Wrench: <Wrench color="#6366f1" size={28} />,
    Zap: <Zap color="#6366f1" size={28} />,
    PaintRoller: <PaintRoller color="#6366f1" size={28} />,
    Sprout: <Sprout color="#6366f1" size={28} />,
    PackageOpen: <PackageOpen color="#6366f1" size={28} />,
    Cog: <Cog color="#6366f1" size={28} />,
    Bug: <Bug color="#6366f1" size={28} />,
    Hammer: <Hammer color="#6366f1" size={28} />,
    Router: <Router color="#6366f1" size={28} />,
    Package: <Package color="#6366f1" size={28} />,
    CreditCard: <CreditCard color="#6366f1" size={28} />,
  };

  return (
    <View testID={testID}>
      <View
        className={cn(
          'p-6 rounded-xl items-center justify-center bg-surface border border-divider',
          'shadow-sm shadow-black/5',
        )}
        testID={testID ? `${testID}.container` : undefined}>
        <View
          className="flex items-center justify-center bg-primary/10 rounded-full p-4"
          testID={testID ? `${testID}.icon` : undefined}>
          {IconMap[iconName as keyof typeof IconMap]}
        </View>
      </View>
      <Text
        className="text-sm text-center font-medium mt-2 text-text-primary"
        testID={testID ? `${testID}.label` : undefined}>
        {serviceName}
      </Text>
    </View>
  );
};

export default ServiceTile;
