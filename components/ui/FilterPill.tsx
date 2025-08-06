import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface FilterPillProps {
  label: string;
  selected: boolean;
  count?: number;
  onPress: () => void;
}

const FilterPill: React.FC<FilterPillProps> = ({
  label,
  selected,
  count,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-3 rounded-full border ${
        selected ? 'bg-primary border-primary' : 'bg-background border-divider'
      }`}
      activeOpacity={0.7}>
      <Text
        className={`font-medium text-sm ${
          selected ? 'text-white' : 'text-text-secondary'
        }`}>
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default FilterPill;