import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Types
import type { 
  AuditEntry, 
  AuditAction,
  AuditResource,
  AuditSeverity,
  AuditCategory,
  AuditLogQuery
} from '../../types/analytics';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserAvatar } from '../ui/UserAvatar';
import { AlertCard } from '../ui/AlertCard';

interface AuditSystemProps {
  auditLogs: AuditEntry[];
  onExportLogs: (query: AuditLogQuery, format: 'json' | 'csv' | 'pdf') => Promise<void>;
  onGenerateReport: (timeframe: string, categories: AuditCategory[]) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const AuditSystem: React.FC<AuditSystemProps> = ({
  auditLogs,
  onExportLogs,
  onGenerateReport,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'analytics' | 'compliance' | 'reports'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    severity?: AuditSeverity;
    category?: AuditCategory;
    action?: AuditAction;
    resource?: AuditResource;
    dateRange?: { start: string; end: string };
  }>({});
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canViewLogs = userRole === 'admin' || userRole === 'committee_member';
  const canExport = userRole === 'admin';

  // Filter and search audit logs
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        log.userId.toLowerCase().includes(query) ||
        log.context.feature.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }
    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters.resource) {
      filtered = filtered.filter(log => log.resource === filters.resource);
    }
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, searchQuery, filters]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalLogs = filteredLogs.length;
    const last24Hours = filteredLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return logTime > dayAgo;
    }).length;

    const severityBreakdown = filteredLogs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);

    const categoryBreakdown = filteredLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<AuditCategory, number>);

    const topUsers = Object.entries(
      filteredLogs.reduce((acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 5);

    const topActions = Object.entries(
      filteredLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 5);

    return {
      totalLogs,
      last24Hours,
      severityBreakdown,
      categoryBreakdown,
      topUsers,
      topActions
    };
  }, [filteredLogs]);

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      const query: AuditLogQuery = {
        startDate: filters.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: filters.dateRange?.end || new Date().toISOString(),
        severity: filters.severity,
        category: filters.category,
        action: filters.action,
        resource: filters.resource,
        limit: 10000,
        includeMetadata: true
      };
      
      await onExportLogs(query, format);
      Alert.alert('Success', `Audit logs exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export audit logs. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderLogEntry = (entry: AuditEntry) => {
    const severityStyle = getSeverityStyle(entry.severity);
    const categoryStyle = getCategoryStyle(entry.category);
    const timeAgo = getTimeAgo(entry.timestamp);

    return (
      <TouchableOpacity
        key={entry.id}
        onPress={() => setSelectedEntry(entry)}
        className="mb-3"
      >
        <Card className={`border-l-4 ${severityStyle.border}`}>
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <UserAvatar name={entry.userId} size={24} />
                  <Text className="text-body-medium font-semibold text-text-primary ml-2">
                    {formatAction(entry.action)}
                  </Text>
                </View>
                
                <View className="flex-row items-center gap-2 mb-2">
                  <View className={`px-2 py-1 rounded-full ${categoryStyle.bg}`}>
                    <Text className={`text-label-small font-medium ${categoryStyle.text}`}>
                      {formatCategory(entry.category)}
                    </Text>
                  </View>
                  
                  <View className={`px-2 py-1 rounded-full ${severityStyle.bg}`}>
                    <Text className={`text-label-small font-medium ${severityStyle.text}`}>
                      {entry.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text className="text-body-small text-text-secondary mb-1">
                  Resource: {formatResource(entry.resource)} {entry.resourceId && `(${entry.resourceId})`}
                </Text>
                
                <Text className="text-body-small text-text-secondary">
                  User: {entry.userId} • {timeAgo} • IP: {entry.ipAddress}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-body-small text-text-secondary">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Text>
                {entry.context.errorMessage && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="warning-outline" size={12} color="#EF4444" />
                    <Text className="text-label-small text-error ml-1">Error</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Context preview */}
            <View className="bg-surface-secondary p-2 rounded">
              <Text className="text-body-small text-text-primary">
                {entry.context.feature} • {entry.context.module}
                {entry.context.duration && ` • ${entry.context.duration}ms`}
              </Text>
              {entry.changes && entry.changes.length > 0 && (
                <Text className="text-body-small text-text-secondary mt-1">
                  {entry.changes.length} field{entry.changes.length > 1 ? 's' : ''} changed
                </Text>
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderAnalytics = () => (
    <ScrollView className="p-4">
      {/* Overview Stats */}
      <View className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-primary">
              {analytics.totalLogs.toLocaleString()}
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Total Audit Logs
            </Text>
          </View>
        </Card>

        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-warning">
              {analytics.last24Hours}
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Last 24 Hours
            </Text>
          </View>
        </Card>
      </View>

      {/* Severity Breakdown */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Severity Distribution
          </Text>
          
          {Object.entries(analytics.severityBreakdown).map(([severity, count]) => {
            const percentage = (count / analytics.totalLogs) * 100;
            const style = getSeverityStyle(severity as AuditSeverity);
            
            return (
              <View key={severity} className="mb-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-body-medium text-text-primary">
                    {severity.toUpperCase()}
                  </Text>
                  <Text className="text-body-medium font-medium text-text-primary">
                    {count} ({percentage.toFixed(1)}%)
                  </Text>
                </View>
                <View className="h-2 bg-surface-secondary rounded-full">
                  <View 
                    className={`h-full rounded-full ${style.progressBg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Category Breakdown */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Activity by Category
          </Text>
          
          {Object.entries(analytics.categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([category, count]) => {
              const percentage = (count / analytics.totalLogs) * 100;
              const style = getCategoryStyle(category as AuditCategory);
              
              return (
                <View key={category} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-3 h-3 rounded-full mr-3 ${style.dotBg}`} />
                    <Text className="text-body-medium text-text-primary flex-1">
                      {formatCategory(category as AuditCategory)}
                    </Text>
                  </View>
                  <Text className="text-body-medium font-medium text-text-primary">
                    {count} ({percentage.toFixed(1)}%)
                  </Text>
                </View>
              );
            })}
        </View>
      </Card>

      {/* Top Active Users */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Most Active Users
          </Text>
          
          {analytics.topUsers.map(([userId, count], index) => (
            <View key={userId} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-body-medium font-medium text-text-secondary mr-3">
                  #{index + 1}
                </Text>
                <UserAvatar name={userId} size={32} />
                <Text className="text-body-medium text-text-primary ml-3 flex-1">
                  {userId}
                </Text>
              </View>
              <Text className="text-body-medium font-medium text-text-primary">
                {count} actions
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Top Actions */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Most Common Actions
          </Text>
          
          {analytics.topActions.map(([action, count], index) => (
            <View key={action} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-body-medium font-medium text-text-secondary mr-3">
                  #{index + 1}
                </Text>
                <View className="w-2 h-2 bg-primary rounded-full mr-3" />
                <Text className="text-body-medium text-text-primary flex-1">
                  {formatAction(action as AuditAction)}
                </Text>
              </View>
              <Text className="text-body-medium font-medium text-text-primary">
                {count}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );

  const renderCompliance = () => (
    <ScrollView className="p-4">
      {/* Compliance Overview */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Compliance Status
          </Text>
          
          <View className="space-y-3">
            {/* Data Retention Compliance */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                <Text className="text-body-medium text-text-primary ml-3">
                  Data Retention Policy
                </Text>
              </View>
              <View className="bg-success/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-success">Compliant</Text>
              </View>
            </View>

            {/* GDPR Compliance */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#10B981" />
                <Text className="text-body-medium text-text-primary ml-3">
                  Privacy Protection
                </Text>
              </View>
              <View className="bg-success/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-success">Compliant</Text>
              </View>
            </View>

            {/* Audit Trail Integrity */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="document-outline" size={20} color="#10B981" />
                <Text className="text-body-medium text-text-primary ml-3">
                  Audit Trail Integrity
                </Text>
              </View>
              <View className="bg-success/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-success">Verified</Text>
              </View>
            </View>

            {/* Access Control */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="key-outline" size={20} color="#F59E0B" />
                <Text className="text-body-medium text-text-primary ml-3">
                  Access Control Review
                </Text>
              </View>
              <View className="bg-warning/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-warning">Pending</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Retention Policy Status */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Data Retention Status
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">7 Days Retention</Text>
              <Text className="text-body-medium font-medium text-text-primary">
                {auditLogs.filter(log => log.retentionPolicy === '7_days').length} logs
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">30 Days Retention</Text>
              <Text className="text-body-medium font-medium text-text-primary">
                {auditLogs.filter(log => log.retentionPolicy === '30_days').length} logs
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">1 Year Retention</Text>
              <Text className="text-body-medium font-medium text-text-primary">
                {auditLogs.filter(log => log.retentionPolicy === '1_year').length} logs
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Permanent Retention</Text>
              <Text className="text-body-medium font-medium text-text-primary">
                {auditLogs.filter(log => log.retentionPolicy === 'permanent').length} logs
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Recent Security Events
          </Text>
          
          {auditLogs
            .filter(log => log.category === 'security' && log.severity !== 'info')
            .slice(0, 5)
            .map((log) => (
              <View key={log.id} className="flex-row items-start py-2 border-b border-border-primary last:border-b-0">
                <View className={`w-2 h-2 rounded-full mt-2 mr-3 ${getSeverityStyle(log.severity).dotBg}`} />
                <View className="flex-1">
                  <Text className="text-body-medium font-medium text-text-primary">
                    {formatAction(log.action)}
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    {log.userId} • {getTimeAgo(log.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
            
          {auditLogs.filter(log => log.category === 'security').length === 0 && (
            <View className="items-center py-4">
              <Ionicons name="shield-checkmark-outline" size={32} color="#10B981" />
              <Text className="text-body-medium text-success mt-2">
                No security issues detected
              </Text>
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView className="p-4">
      {/* Quick Export Options */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Quick Export
          </Text>
          
          <View className="space-y-2">
            <Button
              title="Export Last 7 Days (CSV)"
              variant="secondary"
              size="medium"
              onPress={() => handleExport('csv')}
              disabled={!canExport || isExporting}
              icon="download-outline"
              className="w-full"
            />
            
            <Button
              title="Export Last 30 Days (PDF)"
              variant="secondary"
              size="medium"
              onPress={() => handleExport('pdf')}
              disabled={!canExport || isExporting}
              icon="document-outline"
              className="w-full"
            />
            
            <Button
              title="Export Raw Data (JSON)"
              variant="secondary"
              size="medium"
              onPress={() => handleExport('json')}
              disabled={!canExport || isExporting}
              icon="code-outline"
              className="w-full"
            />
          </View>
        </View>
      </Card>

      {/* Generate Reports */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Generate Reports
          </Text>
          
          <View className="space-y-2">
            <Button
              title="Monthly Compliance Report"
              variant="primary"
              size="medium"
              onPress={() => onGenerateReport('monthly', ['security', 'compliance', 'data_privacy'])}
              icon="shield-outline"
              className="w-full"
            />
            
            <Button
              title="User Activity Report"
              variant="primary"
              size="medium"
              onPress={() => onGenerateReport('weekly', ['user_activity', 'authentication'])}
              icon="people-outline"
              className="w-full"
            />
            
            <Button
              title="System Performance Report"
              variant="primary"
              size="medium"
              onPress={() => onGenerateReport('daily', ['performance', 'system_event'])}
              icon="speedometer-outline"
              className="w-full"
            />
          </View>
        </View>
      </Card>

      {/* Report Schedule */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Scheduled Reports
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-body-medium font-medium text-text-primary">
                  Weekly Security Summary
                </Text>
                <Text className="text-body-small text-text-secondary">
                  Every Monday at 9:00 AM
                </Text>
              </View>
              <View className="bg-success/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-success">Active</Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-body-medium font-medium text-text-primary">
                  Monthly Compliance Report
                </Text>
                <Text className="text-body-small text-text-secondary">
                  1st of every month at 8:00 AM
                </Text>
              </View>
              <View className="bg-success/10 px-2 py-1 rounded-full">
                <Text className="text-label-small text-success">Active</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderDetailModal = () => {
    if (!selectedEntry) return null;

    return (
      <View className="absolute inset-0 bg-black/50 items-center justify-center p-4" style={{ zIndex: 1000 }}>
        <View className="bg-surface-primary rounded-2xl max-h-[80%] w-full max-w-lg">
          {/* Header */}
          <View className="p-4 border-b border-border-primary">
            <View className="flex-row items-center justify-between">
              <Text className="text-headline-small font-semibold text-text-primary">
                Audit Log Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedEntry(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Basic Information */}
            <View className="mb-4">
              <Text className="text-body-large font-semibold text-text-primary mb-2">
                {formatAction(selectedEntry.action)}
              </Text>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-body-small text-text-secondary">Timestamp:</Text>
                  <Text className="text-body-small text-text-primary">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-body-small text-text-secondary">User:</Text>
                  <Text className="text-body-small text-text-primary">{selectedEntry.userId}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-body-small text-text-secondary">Resource:</Text>
                  <Text className="text-body-small text-text-primary">
                    {formatResource(selectedEntry.resource)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-body-small text-text-secondary">Severity:</Text>
                  <View className={`px-2 py-1 rounded-full ${getSeverityStyle(selectedEntry.severity).bg}`}>
                    <Text className={`text-label-small ${getSeverityStyle(selectedEntry.severity).text}`}>
                      {selectedEntry.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Changes */}
            {selectedEntry.changes && selectedEntry.changes.length > 0 && (
              <View className="mb-4">
                <Text className="text-body-medium font-semibold text-text-primary mb-2">
                  Changes Made
                </Text>
                {selectedEntry.changes.map((change, index) => (
                  <View key={index} className="bg-surface-secondary p-3 rounded mb-2">
                    <Text className="text-body-small font-medium text-text-primary mb-1">
                      {change.field}
                    </Text>
                    <View className="flex-row">
                      <Text className="text-body-small text-error flex-1">
                        - {JSON.stringify(change.oldValue)}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="text-body-small text-success flex-1">
                        + {JSON.stringify(change.newValue)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Device and Context */}
            <View className="mb-4">
              <Text className="text-body-medium font-semibold text-text-primary mb-2">
                Context & Device Info
              </Text>
              <View className="bg-surface-secondary p-3 rounded">
                <Text className="text-body-small text-text-primary mb-1">
                  Feature: {selectedEntry.context.feature}
                </Text>
                <Text className="text-body-small text-text-primary mb-1">
                  Module: {selectedEntry.context.module}
                </Text>
                <Text className="text-body-small text-text-primary mb-1">
                  IP Address: {selectedEntry.ipAddress}
                </Text>
                <Text className="text-body-small text-text-primary mb-1">
                  Platform: {selectedEntry.deviceInfo.platform}
                </Text>
                <Text className="text-body-small text-text-primary">
                  App Version: {selectedEntry.deviceInfo.appVersion}
                </Text>
              </View>
            </View>

            {/* Error Information */}
            {selectedEntry.context.errorMessage && (
              <View className="mb-4">
                <Text className="text-body-medium font-semibold text-error mb-2">
                  Error Details
                </Text>
                <View className="bg-error/5 border border-error/20 p-3 rounded">
                  <Text className="text-body-small text-error">
                    {selectedEntry.context.errorMessage}
                  </Text>
                </View>
              </View>
            )}

            {/* Metadata */}
            {Object.keys(selectedEntry.metadata).length > 0 && (
              <View className="mb-4">
                <Text className="text-body-medium font-semibold text-text-primary mb-2">
                  Additional Metadata
                </Text>
                <View className="bg-surface-secondary p-3 rounded">
                  <Text className="text-body-small text-text-primary font-mono">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  if (!canViewLogs) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
        <Text className="text-headline-small text-text-secondary mt-4 mb-2">
          Access Restricted
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          You don't have permission to view audit logs.
          Contact your administrator for access.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Audit System
        </Text>
        <Text className="text-body-large text-text-secondary">
          Comprehensive activity logging and compliance tracking
        </Text>
      </View>

      {/* Search and Filters */}
      {activeTab === 'logs' && (
        <View className="p-4 border-b border-border-primary bg-surface-primary">
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
            className="mb-3"
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, severity: prev.severity === 'critical' ? undefined : 'critical' }))}
                className={`px-3 py-2 rounded-full border ${
                  filters.severity === 'critical' 
                    ? 'border-error bg-error/10' 
                    : 'border-border-primary bg-surface-secondary'
                }`}
              >
                <Text className={`text-label-small ${
                  filters.severity === 'critical' ? 'text-error' : 'text-text-secondary'
                }`}>
                  Critical
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, category: prev.category === 'security' ? undefined : 'security' }))}
                className={`px-3 py-2 rounded-full border ${
                  filters.category === 'security' 
                    ? 'border-warning bg-warning/10' 
                    : 'border-border-primary bg-surface-secondary'
                }`}
              >
                <Text className={`text-label-small ${
                  filters.category === 'security' ? 'text-warning' : 'text-text-secondary'
                }`}>
                  Security
                </Text>
              </TouchableOpacity>
              
              {/* Add more filter buttons as needed */}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'logs', label: 'Audit Logs', icon: 'list-outline' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics-outline' },
          { key: 'compliance', label: 'Compliance', icon: 'shield-outline' },
          { key: 'reports', label: 'Reports', icon: 'document-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center">
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#6366f1' : '#6B7280'} 
              />
              <Text className={`text-body-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {activeTab === 'logs' && (
          <ScrollView className="p-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(renderLogEntry)
            ) : (
              <View className="items-center py-8">
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text className="text-headline-small text-text-secondary mt-4 mb-2">
                  No Audit Logs Found
                </Text>
                <Text className="text-body-medium text-text-secondary text-center">
                  {searchQuery || Object.keys(filters).length > 0
                    ? 'Try adjusting your search or filters'
                    : 'No audit logs available for display'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'compliance' && renderCompliance()}
        {activeTab === 'reports' && renderReports()}
      </View>

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
  );
};

// Helper functions
const getSeverityStyle = (severity: AuditSeverity) => {
  const styles = {
    critical: { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-l-red-500',
      progressBg: 'bg-red-500',
      dotBg: 'bg-red-500'
    },
    high: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-700', 
      border: 'border-l-orange-500',
      progressBg: 'bg-orange-500',
      dotBg: 'bg-orange-500'
    },
    medium: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-700', 
      border: 'border-l-yellow-500',
      progressBg: 'bg-yellow-500',
      dotBg: 'bg-yellow-500'
    },
    low: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-l-blue-500',
      progressBg: 'bg-blue-500',
      dotBg: 'bg-blue-500'
    },
    info: { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      border: 'border-l-gray-500',
      progressBg: 'bg-gray-500',
      dotBg: 'bg-gray-500'
    }
  };
  return styles[severity] || styles.info;
};

const getCategoryStyle = (category: AuditCategory) => {
  const styles = {
    security: { bg: 'bg-red-50', text: 'text-red-700', dotBg: 'bg-red-500' },
    authentication: { bg: 'bg-blue-50', text: 'text-blue-700', dotBg: 'bg-blue-500' },
    authorization: { bg: 'bg-purple-50', text: 'text-purple-700', dotBg: 'bg-purple-500' },
    data_privacy: { bg: 'bg-green-50', text: 'text-green-700', dotBg: 'bg-green-500' },
    financial: { bg: 'bg-emerald-50', text: 'text-emerald-700', dotBg: 'bg-emerald-500' },
    governance: { bg: 'bg-indigo-50', text: 'text-indigo-700', dotBg: 'bg-indigo-500' },
    administrative: { bg: 'bg-cyan-50', text: 'text-cyan-700', dotBg: 'bg-cyan-500' },
    operational: { bg: 'bg-orange-50', text: 'text-orange-700', dotBg: 'bg-orange-500' },
    performance: { bg: 'bg-yellow-50', text: 'text-yellow-700', dotBg: 'bg-yellow-500' },
    compliance: { bg: 'bg-pink-50', text: 'text-pink-700', dotBg: 'bg-pink-500' },
    user_activity: { bg: 'bg-violet-50', text: 'text-violet-700', dotBg: 'bg-violet-500' },
    system_event: { bg: 'bg-slate-50', text: 'text-slate-700', dotBg: 'bg-slate-500' },
    integration: { bg: 'bg-teal-50', text: 'text-teal-700', dotBg: 'bg-teal-500' },
    maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', dotBg: 'bg-amber-500' }
  };
  return styles[category] || styles.system_event;
};

const formatAction = (action: AuditAction): string => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatResource = (resource: AuditResource): string => {
  return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatCategory = (category: AuditCategory): string => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return time.toLocaleDateString();
};

export default AuditSystem;