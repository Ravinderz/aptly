/**
 * Development API Test Screen
 * Only available in development mode to test backend integration
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { APITester } from '../components/dev/APITester';

export default function DevAPITestScreen() {
  // Only show in development mode
  if (!__DEV__) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>This screen is only available in development mode</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <APITester />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});