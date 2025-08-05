import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PillFilter from '@/components/ui/PillFilter';
import { cn } from '@/utils/cn';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  User,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

// Mock data for onboarding requests
const mockOnboardingRequests = [
  {
    id: 'req-1',
    societyName: 'Green Valley Apartments',
    societyCode: 'GVA001',
    adminName: 'Rajesh Kumar',
    adminEmail: 'rajesh@greenvalley.com',
    adminPhone: '+91-9876543210',
    societyAddress: '123 Green Valley Road, Sector 45, Gurgaon',
    totalFlats: 120,
    status: 'pending',
    submittedDocuments: [
      'society_registration.pdf',
      'noc_certificate.pdf',
      'admin_id_proof.pdf',
    ],
    verificationNotes: null,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'req-2',
    societyName: 'Blue Ridge Society',
    societyCode: 'BRS002',
    adminName: 'Priya Sharma',
    adminEmail: 'priya@blueridge.com',
    adminPhone: '+91-9876543211',
    societyAddress: '456 Blue Ridge Lane, Sector 12, Noida',
    totalFlats: 80,
    status: 'under_review',
    submittedDocuments: ['society_registration.pdf', 'admin_id_proof.pdf'],
    verificationNotes: 'Missing NOC certificate',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 'req-3',
    societyName: 'Sunrise Towers',
    societyCode: 'ST003',
    adminName: 'Amit Patel',
    adminEmail: 'amit@sunrisetowers.com',
    adminPhone: '+91-9876543212',
    societyAddress: '789 Sunrise Avenue, Sector 22, Delhi',
    totalFlats: 200,
    status: 'approved',
    submittedDocuments: [
      'society_registration.pdf',
      'noc_certificate.pdf',
      'admin_id_proof.pdf',
      'bank_details.pdf',
    ],
    verificationNotes: 'All documents verified successfully',
    createdAt: '2024-01-10T11:45:00Z',
    updatedAt: '2024-01-17T16:30:00Z',
  },
];

interface OnboardingRequestCardProps {
  request: any;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const OnboardingRequestCard: React.FC<OnboardingRequestCardProps> = ({
  request,
  onView,
  onApprove,
  onReject,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock size={16} color="#d97706" />,
        };
      case 'under_review':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Eye size={16} color="#2563eb" />,
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={16} color="#059669" />,
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle size={16} color="#dc2626" />,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertTriangle size={16} color="#6b7280" />,
        };
    }
  };

  const statusConfig = getStatusConfig(request?.status || 'pending');
  const daysSinceSubmission = Math.floor(
    (Date.now() - new Date(request?.createdAt || Date.now()).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {request?.societyName || 'Unknown Society'}
          </Text>
          <Text className="text-sm text-gray-600">
            Code: {request?.societyCode || 'N/A'}
          </Text>
        </View>

        <View
          className={cn(
            'flex-row items-center px-2 py-1 rounded-full',
            statusConfig.color,
          )}>
          {statusConfig.icon}
          <Text className="text-xs font-medium ml-1 capitalize">
            {(request?.status || 'pending').replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Admin Details */}
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <User size={14} color="#6b7280" />
          <Text className="text-sm text-gray-700 ml-2">
            {request?.adminName || 'Unknown Admin'}
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          <Mail size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {request?.adminEmail || 'No email provided'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Phone size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {request?.adminPhone || 'No phone provided'}
          </Text>
        </View>
      </View>

      {/* Society Details */}
      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <MapPin size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2 flex-1">
            {request?.societyAddress || 'No address provided'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Building2 size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {request?.totalFlats || 0} units
          </Text>
        </View>
      </View>

      {/* Documents */}
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-900 mb-1">
          Documents ({request?.submittedDocuments?.length || 0})
        </Text>
        <Text className="text-xs text-gray-600">
          {request?.submittedDocuments?.join(', ') || 'No documents'}
        </Text>
      </View>

      {/* Notes */}
      {request?.verificationNotes && (
        <View className="mb-3 p-2 bg-amber-50 rounded-lg">
          <Text className="text-xs text-amber-800">
            Note: {request?.verificationNotes}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-200">
        <View className="flex-row items-center">
          <Calendar size={14} color="#6b7280" />
          <Text className="text-xs text-gray-600 ml-1">
            {daysSinceSubmission} days ago
          </Text>
        </View>

        <View className="flex-row space-x-2">
          <Button onPress={onView} variant="outline" size="sm">
            View
          </Button>

          {request?.status === 'pending' && (
            <>
              <Button
                onPress={onReject}
                variant="outline"
                size="sm"
                className="border-red-300 bg-red-50 text-red-700">
                Reject
              </Button>
              <Button onPress={onApprove} variant="primary" size="sm">
                Approve
              </Button>
            </>
          )}
        </View>
      </View>
    </Card>
  );
};

// Add displayName for debugging purposes
OnboardingRequestCard.displayName = 'OnboardingRequestCard';

/**
 * Society Onboarding Management - Review and approve society applications
 *
 * Features:
 * - List all onboarding requests with status filtering
 * - Quick approve/reject actions
 * - Detailed document verification
 * - Search and filter capabilities
 */
export default function OnboardingManagement() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockOnboardingRequests);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const filteredRequests = (requests || []).filter((request) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        (request?.societyName || '').toLowerCase().includes(query) ||
        (request?.societyCode || '').toLowerCase().includes(query) ||
        (request?.adminName || '').toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      return request?.status === statusFilter;
    }

    return true;
  });

  const handleViewRequest = (requestId: string) => {
    router.push(`/admin/onboarding/${requestId}`);
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'approved', updatedAt: new Date().toISOString() }
          : req,
      ),
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'rejected', updatedAt: new Date().toISOString() }
          : req,
      ),
    );
  };

  const getStatusCounts = () => {
    const safeRequests = requests || [];
    return {
      pending: safeRequests.filter((r) => r?.status === 'pending').length,
      under_review: safeRequests.filter((r) => r?.status === 'under_review')
        .length,
      approved: safeRequests.filter((r) => r?.status === 'approved').length,
      rejected: safeRequests.filter((r) => r?.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader
        title="Society Onboarding"
        subtitle={`${filteredRequests.length} applications`}
        showBack
        showNotifications
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {/* Search and Filters */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mb-4">
            <Search size={20} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search applications..."
              className="flex-1 ml-2 text-gray-900"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {filterOptions.map((option) => (
                <PillFilter
                  key={option.value}
                  label={option.label}
                  selected={statusFilter === option.value}
                  onPress={() => setStatusFilter(option.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Statistics */}
        <View className="px-4 py-4 bg-white mb-2">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold text-yellow-600">
                {statusCounts.pending}
              </Text>
              <Text className="text-sm text-gray-600">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-blue-600">
                {statusCounts.under_review}
              </Text>
              <Text className="text-sm text-gray-600">Under Review</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-green-600">
                {statusCounts.approved}
              </Text>
              <Text className="text-sm text-gray-600">Approved</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-red-600">
                {statusCounts.rejected}
              </Text>
              <Text className="text-sm text-gray-600">Rejected</Text>
            </View>
          </View>
        </View>

        {/* Request List */}
        <View className="px-4">
          {filteredRequests.length > 0 ? (
            <View>
              {filteredRequests.map((request) => (
                <OnboardingRequestCard
                  key={request.id}
                  request={request}
                  onView={() => handleViewRequest(request.id)}
                  onApprove={() => handleApproveRequest(request.id)}
                  onReject={() => handleRejectRequest(request.id)}
                />
              ))}
            </View>
          ) : (
            <Card className="p-8 items-center">
              <Building2 size={48} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
                {searchQuery ? 'No applications found' : 'No applications yet'}
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Society onboarding applications will appear here'}
              </Text>
            </Card>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
