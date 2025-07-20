import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AptlyStackHeaderProps {
  title: string;
  showBackButton?: boolean;
  height?: number;
  backgroundColor?: string;
  tintColor?: string;
}

const AptlyStackHeader = ({
  title,
  showBackButton = true,
  tintColor = "#f89b7c",
}: AptlyStackHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.customHeaderContainer,
        { height: 50, backgroundColor: "#fff" },
      ]}
      className="border-b border-border-color elevation-sm z-10"
    >
      <View className="flex flex-row justify-between w-full">
        {showBackButton && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={tintColor} />
          </TouchableOpacity>
        )}
        <Text style={[styles.customHeaderTitle, { color: tintColor }]}>
          {title}
        </Text>
        <Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeaderContainer: {
    flexDirection: "row",
    alignItems: "flex-end", // Align items to the bottom of the header space
    justifyContent: "center",
    paddingBottom: Platform.OS === "ios" ? 10 : 15, // Adjust padding for status bar and content
    paddingHorizontal: 15,
    // Add platform-specific padding for safe areas if not handled by a global SafeAreaView
    paddingTop: Platform.OS === "ios" ? 44 : 20, // Example: iOS status bar height ~44, Android ~20
  },
  customHeaderTitle: {
    fontSize: 18, // Adjust font size as needed
    fontWeight: "bold",
    // flex: 1, // Uncomment if you want title to take up remaining space and push back button
    textAlign: "center", // Center the title
  },
});

export default AptlyStackHeader;
