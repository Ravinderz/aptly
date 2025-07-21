import { Search, X } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}

const AptlySearchBar: React.FC<SearchBarProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  onSearch,
  onClear 
}) => {
  const handleSearch = () => {
    onSearch?.();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };
  return (
    <View className="flex flex-row gap-2 items-center w-full">
      <View className="flex-[11] relative">
        <TextInput
          placeholder={placeholder}
          cursorColor={"#6366f1"}
          className="w-full p-3 pr-10 border border-divider rounded-xl bg-surface text-text-primary"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="absolute right-3 top-1/2 -translate-y-2"
            style={{ transform: [{ translateY: -10 }] }}
          >
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity 
        onPress={handleSearch}
        className="bg-primary rounded-xl py-3 px-4 flex-[1] items-center justify-center"
        activeOpacity={0.7}
      >
        <Search size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AptlySearchBar;
