import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";

const ElevatedButton = ({ label }: { label: string }) => {
  return (
    <TouchableOpacity
      className="h-40 w-40 flex items-center justify-center rounded-lg bg-white"
      style={styles.button}
    >
      <Text className="font-bold">{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fffafa", // Important: Shadows look best on a non-transparent background
    borderRadius: 8, // Use a consistent radius
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 }, // Subtle vertical offset
        shadowOpacity: 0.15, // Reduced opacity for a subtle shadow
        shadowRadius: 4, //  Adjust radius as needed
      },
      android: {
        elevation: 2, //  Subtle elevation for Android
      },
    }),
  },
});

export default ElevatedButton;
