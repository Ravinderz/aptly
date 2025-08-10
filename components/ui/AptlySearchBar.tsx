import { Search, X } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  testID?: string;
}

const AptlySearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
  onSearch,
  onClear,
  testID,
}) => {
  const handleSearch = () => {
    onSearch?.();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };
  return (
    <View className="flex flex-row gap-2 items-center w-full" testID={testID}>
      <View className="flex-[11] relative" testID={testID ? `${testID}.input-container` : undefined}>
        <TextInput
          placeholder={placeholder}
          cursorColor={'#6366f1'}
          className="w-full p-3 pr-10 border border-divider rounded-xl bg-surface text-text-primary"
          placeholderTextColor="#757575"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          testID={testID ? `${testID}.input` : undefined}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="absolute right-3 top-1/2 -translate-y-2"
            style={{ transform: [{ translateY: -10 }] }}
            testID={testID ? `${testID}.clear` : undefined}>
            <X size={16} color="#757575" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={handleSearch}
        className="bg-primary rounded-xl py-3 px-4 flex-[1] items-center justify-center"
        activeOpacity={0.7}
        testID={testID ? `${testID}.search` : undefined}>
        <Search size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AptlySearchBar;
