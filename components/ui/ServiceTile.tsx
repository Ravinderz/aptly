import React from 'react';
import { View, Text } from 'react-native';
import { icons } from 'lucide-react-native';
import { styled } from 'nativewind';

// Define props interface
interface ServiceTileProps {
  iconName: string;
  serviceName: string;
  backgroundColor: string;
}

// Styled components for NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);

const ServiceTile: React.FC<ServiceTileProps> = ({
  iconName,
  serviceName,
  backgroundColor,
}) => {
  // Dynamically select the icon
  const LucideIcon = icons[iconName as keyof typeof icons];

  return (
    <StyledView
      className={`p-4 rounded-lg items-center justify-center ${backgroundColor}`}
    >
      {LucideIcon && (
        <LucideIcon color="#6366f1" size={28} />
      )}
      <StyledText className="text-center font-semibold mt-2">
        {serviceName}
      </StyledText>
    </StyledView>
  );
};

export default ServiceTile;
