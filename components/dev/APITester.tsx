/**
 * API Tester Component
 * Development component to test backend API integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import { apiClient } from '../../services/api.client';
import { services } from '../../services';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const APITester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      }
      return [...prev, { name, status, message, data }];
    });
  };

  const testBackendConnection = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Basic connectivity
      updateResult('Health Check', 'pending');
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          updateResult('Health Check', 'success', `Status: ${response.status}`, data);
        } else {
          updateResult('Health Check', 'error', `HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        updateResult('Health Check', 'error', error instanceof Error ? error.message : 'Unknown error');
      }

      // Test 2: Modern Services
      updateResult('Notices Service', 'pending');
      try {
        const noticesResult = await services.notices.getNotices();
        if (noticesResult.success && Array.isArray(noticesResult.data)) {
          updateResult('Notices Service', 'success', `Found ${noticesResult.data.length} notices`, noticesResult.data);
        } else {
          updateResult('Notices Service', 'error', noticesResult.error || 'Failed to fetch notices');
        }
      } catch (error: any) {
        updateResult('Notices Service', 'error', error.message);
      }

      updateResult('Visitors Service', 'pending');
      try {
        const visitorsResult = await services.visitors.getTodayVisitors();
        if (visitorsResult.success && Array.isArray(visitorsResult.data)) {
          updateResult('Visitors Service', 'success', `Found ${visitorsResult.data.length} today's visitors`, visitorsResult.data);
        } else {
          updateResult('Visitors Service', 'error', visitorsResult.error || 'Failed to fetch visitors');
        }
      } catch (error: any) {
        updateResult('Visitors Service', 'error', error.message);
      }

      // Test 3: Specific endpoints
      const endpointsToTest = [
        { name: 'System Health', url: API_ENDPOINTS.SYSTEM.HEALTH },
        { name: 'API Info', url: API_ENDPOINTS.SYSTEM.API_INFO },
        { name: 'Notices List', url: API_ENDPOINTS.NOTICES.LIST },
        { name: 'Visitors V2', url: API_ENDPOINTS.VISITORS.LIST },
        { name: 'Visitors Today', url: API_ENDPOINTS.VISITORS.TODAY },
        { name: 'Admin Dashboard', url: API_ENDPOINTS.ADMIN.DASHBOARD },
        { name: 'Manager Dashboard', url: API_ENDPOINTS.MANAGER.DASHBOARD },
        { name: 'Security Dashboard', url: API_ENDPOINTS.SECURITY.DASHBOARD },
      ];

      for (const endpoint of endpointsToTest) {
        updateResult(endpoint.name, 'pending');
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint.url}`);
          if (response.status === 404) {
            updateResult(endpoint.name, 'error', 'Endpoint not found (404)');
          } else if (response.status >= 400 && response.status < 500) {
            updateResult(endpoint.name, 'success', `Available (auth required: ${response.status})`);
          } else if (response.ok) {
            updateResult(endpoint.name, 'success', `Available and accessible`);
          } else {
            updateResult(endpoint.name, 'error', `HTTP ${response.status}`);
          }
        } catch (error) {
          updateResult(endpoint.name, 'error', error instanceof Error ? error.message : 'Unknown error');
        }
      }

    } catch (error) {
      Alert.alert('Test Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Backend Tester</Text>
        <Text style={styles.subtitle}>Backend URL: {API_CONFIG.BASE_URL}</Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, testing && styles.testButtonDisabled]}
        onPress={testBackendConnection}
        disabled={testing}
      >
        <Text style={styles.testButtonText}>
          {testing ? 'Testing...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
              <Text style={styles.resultName}>{result.name}</Text>
            </View>
            {result.message && (
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
            )}
            {result.data && (
              <Text style={styles.resultData}>
                {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : result.data}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {results.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Results: {results.filter(r => r.status === 'success').length} success, {' '}
            {results.filter(r => r.status === 'error').length} errors, {' '}
            {results.filter(r => r.status === 'pending').length} pending
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultData: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    color: '#374151',
  },
  summary: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
});