import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure this import is present

interface AptlySearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const AptlySearchBar: React.FC<AptlySearchBarProps> = ({ placeholder = "Search...", onSearch }) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mx-3 my-2 shadow-sm">
      <Ionicons name="search" size={20} color="gray" className="mr-2" />
      <TextInput
        className="flex-1 text-base text-gray-700"
        placeholder={placeholder}
        onChangeText={onSearch}
        placeholderTextColor="gray"
      />
    </View>
  );
};

export default AptlySearchBar;
