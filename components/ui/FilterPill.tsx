import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterPill = ({
  label,
  isActive,
  onPress,
}: FilterPillProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-3 rounded-full border ${
        isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'
      }`}
      activeOpacity={0.7}>
      <Text
        className={`font-medium text-sm ${
          isActive ? 'text-white' : 'text-gray-600'
        }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

FilterPill.displayName = 'FilterPill';

export { FilterPill };
export default FilterPill;