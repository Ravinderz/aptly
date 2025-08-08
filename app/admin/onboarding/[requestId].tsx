import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  XCircle,
  Download,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react-native';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  LoadingWrapper, 
  useAsyncState, 
  ErrorMessage,
  NotFoundError,
  LoadingSpinner 
} from '@/components/ui/LoadingStates';
import { cn } from '@/utils/cn';
import { onboardingService } from '@/services/onboarding.service';
import type { OnboardingRequest } from '@/services/onboarding.service';

// Remove mock data - using real API

interface ApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  type: 'approve' | 'reject';
  submitting?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  onClose,
  onConfirm,
  type,
  submitting = false,
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">
            {type === 'approve' ? 'Approve Application' : 'Reject Application'}
          </Text>
        </View>

        <View className="flex-1 p-4">
          <Text className="text-base font-medium text-gray-900 mb-2">
            {type === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            {type === 'approve' 
              ? 'Add any notes or conditions for the approval (optional)'
              : 'Please provide a reason for rejection'
            }
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={type === 'approve' 
              ? "Additional notes or conditions..."
              : "Reason for rejection..."
            }
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-lg p-3 text-gray-900"
            style={{ textAlignVertical: 'top' }}
          />

          <View className="flex-row space-x-3 mt-6">
            <Button
              onPress={onClose}
              variant="outline"
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onPress={handleConfirm}
              variant={type === 'approve' ? 'primary' : 'outline'}
              className={`flex-1 ${type === 'reject' ? 'border-red-300 bg-red-50' : ''}`}
              disabled={submitting || (type === 'reject' && !notes.trim())}
            >
              {submitting ? (
                <View className="flex-row items-center">
                  <LoadingSpinner size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white">
                    {type === 'approve' ? 'Approving...' : 'Rejecting...'}
                  </Text>
                </View>
              ) : (
                type === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Onboarding Request Detail - Detailed view of society onboarding application
 * 
 * Features:
 * - Complete application review
 * - Document verification
 * - Approval/rejection workflow
 * - Notes and communication
 */
export default function OnboardingRequestDetail() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const [requestState, { setLoading, setData, setError }] = useAsyncState<OnboardingRequest>();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [submitting, setSubmitting] = useState(false);

  // Load request data on mount
  useEffect(() => {
    loadRequestData();
  }, [requestId]);

  const loadRequestData = async () => {
    if (!requestId || Array.isArray(requestId)) {
      setError(new Error('Invalid request ID'));
      return;
    }

    try {
      setLoading();
      const response = await onboardingService.getRequest(requestId as string);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.message || 'Failed to load request'));
      }
    } catch (error) {
      console.error('Failed to load onboarding request:', error);
      setError(error as Error);
    }
  };

  const handleApprove = () => {
    setApprovalType('approve');
    setShowApprovalModal(true);
  };

  const handleReject = () => {
    setApprovalType('reject');
    setShowApprovalModal(true);
  };

  const handleConfirmAction = async (notes: string) => {
    if (!requestState.data?.id) return;

    try {
      setSubmitting(true);
      
      let response;
      if (approvalType === 'approve') {
        response = await onboardingService.approveRequest(requestState.data.id, {
          notes: notes || undefined,
        });
      } else {
        response = await onboardingService.rejectRequest(requestState.data.id, {
          reason: notes || 'No reason provided',
        });
      }

      if (response.success) {
        Alert.alert(
          'Success',
          `Application ${approvalType === 'approve' ? 'approved' : 'rejected'} successfully`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(response.message || `Failed to ${approvalType} request`);
      }
    } catch (error) {
      console.error(`Failed to ${approvalType} request:`, error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : `Failed to ${approvalType} request. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadDocument = async (documentName: string) => {
    if (!requestState.data?.id) return;

    try {
      const response = await onboardingService.downloadDocument(requestState.data.id, documentName);
      
      if (response.success && response.data?.downloadUrl) {
        // In a real app, you would open the download URL or initiate download
        // For now, we'll show an alert with the download URL
        Alert.alert(
          'Download Ready',
          `Document download is ready. In a real app, this would start the download.`,
          [
            { text: 'OK' }
          ]
        );
        console.log('Document download URL:', response.data.downloadUrl);
      } else {
        throw new Error(response.message || 'Failed to get download URL');
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'Failed to download document. Please try again.'
      );
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <AlertTriangle size={16} color="#d97706" />,
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

  // If no request data yet, statusConfig will be handled by LoadingWrapper
  const statusConfig = requestState.data ? getStatusConfig(requestState.data.status) : null;

  return (
    <LoadingWrapper
      isLoading={requestState.isLoading}
      error={requestState.error}
      isEmpty={!requestState.data}
      onRetry={loadRequestData}
      skeletonProps={{ type: 'card', showAvatar: true }}
      emptyComponent={
        <NotFoundError
          title="Request Not Found"
          message="The onboarding request you're looking for could not be found."
          onGoBack={() => router.back()}
        />
      }
    >
      <View className="flex-1 bg-gray-50">
        <AdminHeader 
          title="Review Application" 
          subtitle={requestState.data?.societyName || 'Loading...'}
          showBack
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-900">
                {requestState.data?.societyName}
              </Text>
              <Text className="text-sm text-gray-600">
                Code: {requestState.data?.societyCode}
              </Text>
            </View>
            
            {statusConfig && (
              <View className={cn(
                'flex-row items-center px-3 py-1 rounded-full',
                statusConfig.color
              )}>
                {statusConfig.icon}
                <Text className="text-sm font-medium ml-1 capitalize">
                  {requestState.data?.status.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Admin Information */}
        <View className="px-4 py-4">
          <Card className="p-4">
            <View className="flex-row items-center mb-3">
              <User size={20} color="#374151" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Admin Information
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 w-20">Name:</Text>
                <Text className="text-sm text-gray-900 flex-1">
                  {requestState.data?.adminName}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Mail size={14} color="#6b7280" />
                <Text className="text-sm text-gray-900 ml-2">
                  {requestState.data?.adminEmail}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Phone size={14} color="#6b7280" />
                <Text className="text-sm text-gray-900 ml-2">
                  {requestState.data?.adminPhone}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Society Information */}
        <View className="px-4 pb-4">
          <Card className="p-4">
            <View className="flex-row items-center mb-3">
              <Building2 size={20} color="#374151" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Society Details
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-start">
                <MapPin size={14} color="#6b7280" className="mt-1" />
                <Text className="text-sm text-gray-900 ml-2 flex-1">
                  {requestState.data?.societyAddress}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Total Units:</Text>
                <Text className="text-sm text-gray-900">{requestState.data?.totalFlats}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Type:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.additionalInfo.societyType}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Built:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.additionalInfo.constructionYear}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Parking:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.additionalInfo.parkingSpaces} spaces
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Monthly Maintenance:</Text>
                <Text className="text-sm text-gray-900">
                  ₹{requestState.data?.additionalInfo.monthlyMaintenance?.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-sm font-medium text-gray-900 mb-2">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {requestState.data?.additionalInfo.amenities?.map((amenity, index) => (
                  <View key={index} className="bg-blue-50 px-2 py-1 rounded">
                    <Text className="text-xs text-blue-700">{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Documents */}
        <View className="px-4 pb-4">
          <Card className="p-4">
            <View className="flex-row items-center mb-3">
              <FileText size={20} color="#374151" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Submitted Documents
              </Text>
            </View>
            
            <View className="space-y-3">
              {requestState.data?.submittedDocuments?.map((doc, index) => (
                <View key={index} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center space-x-2">
                    {doc.verified ? (
                      <CheckCircle size={16} color="#059669" />
                    ) : (
                      <AlertTriangle size={16} color="#d97706" />
                    )}
                    
                    <TouchableOpacity
                      onPress={() => handleDownloadDocument(doc.name)}
                      className="p-1"
                    >
                      <Download size={16} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Verification Notes */}
        {requestState.data?.verificationNotes && (
          <View className="px-4 pb-4">
            <Card className="p-4 bg-amber-50 border-amber-200">
              <View className="flex-row items-center mb-2">
                <MessageSquare size={16} color="#d97706" />
                <Text className="text-sm font-medium text-amber-800 ml-2">
                  Verification Notes
                </Text>
              </View>
              <Text className="text-sm text-amber-700">
                {requestState.data.verificationNotes}
              </Text>
            </Card>
          </View>
        )}

        {/* Application Timeline */}
        <View className="px-4 pb-6">
          <Card className="p-4">
            <View className="flex-row items-center mb-3">
              <Calendar size={20} color="#374151" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Application Timeline
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Submitted:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.createdAt ? new Date(requestState.data.createdAt).toLocaleDateString() : '-'}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Last Updated:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.updatedAt ? new Date(requestState.data.updatedAt).toLocaleDateString() : '-'}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Days Pending:</Text>
                <Text className="text-sm text-gray-900">
                  {requestState.data?.createdAt ? Math.floor((Date.now() - new Date(requestState.data.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
        {requestState.data?.status === 'pending' && (
          <View className="p-4 bg-white border-t border-gray-200">
            <View className="flex-row space-x-3">
              <Button
                onPress={handleReject}
                variant="outline"
                className="flex-1 border-red-300 bg-red-50"
                disabled={submitting}
              >
                Reject
              </Button>
              <Button
                onPress={handleApprove}
                variant="primary"
                className="flex-1"
                disabled={submitting}
              >
                Approve
              </Button>
            </View>
          </View>
        )}

        {/* Approval/Rejection Modal */}
        <ApprovalModal
          visible={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          onConfirm={handleConfirmAction}
          type={approvalType}
          submitting={submitting}
        />
      </View>
    </LoadingWrapper>
  );
}