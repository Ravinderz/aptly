import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const AptlySearchBar = ({ placeholder }: { placeholder: string }) => {
  return (
    <View className="flex flex-row gap-2 items-center w-full">
      <TextInput
        placeholder={placeholder}
        cursorColor={"#6366f1"}
        className="flex-[11] w-full p-2 border border-border-color rounded-lg bg-primary/10 text-primary text-lg "
        placeholderTextColor="#9CA3AF"
        onChangeText={() => {}}
      />
      <TouchableOpacity className=" bg-primary rounded-lg py-3 px-5 flex-[1] items-center justify-center">
        <Search size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AptlySearchBar;
