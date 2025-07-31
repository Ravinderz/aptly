import { useNavigation } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  tintColor = '#6366f1', // Design system primary color as default
}: AptlyStackHeaderProps) => {
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.customHeaderContainer,
        { height: 50, backgroundColor: '#ffffff' }, // Keep white background but explicit
      ]}
      className="border-b border-divider bg-surface z-10">
      <View className="flex flex-row justify-between w-full">
        {showBackButton && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={tintColor} />
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
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom of the header space
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 10 : 15, // Adjust padding for status bar and content
    paddingHorizontal: 15,
    // Add platform-specific padding for safe areas if not handled by a global SafeAreaView
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Example: iOS status bar height ~44, Android ~20
  },
  customHeaderTitle: {
    fontSize: 18, // Following design system headline-medium
    fontWeight: '600', // Semibold weight for better readability
    textAlign: 'center',
  },
});

export default AptlyStackHeader;
