import React, { useState } from 'react';
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
import { cn } from '@/utils/cn';

// Mock data for the specific request
const mockRequestDetail = {
  id: 'req-1',
  societyName: 'Green Valley Apartments',
  societyCode: 'GVA001',
  adminName: 'Rajesh Kumar',
  adminEmail: 'rajesh@greenvalley.com',
  adminPhone: '+91-9876543210',
  societyAddress: '123 Green Valley Road, Sector 45, Gurgaon, Haryana 122001',
  totalFlats: 120,
  status: 'pending',
  submittedDocuments: [
    {
      name: 'society_registration.pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15T10:30:00Z',
      verified: true,
    },
    {
      name: 'noc_certificate.pdf',
      size: '1.8 MB',
      uploadedAt: '2024-01-15T10:35:00Z',
      verified: true,
    },
    {
      name: 'admin_id_proof.pdf',
      size: '1.2 MB',
      uploadedAt: '2024-01-15T10:40:00Z',
      verified: false,
    },
  ],
  verificationNotes: null,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  additionalInfo: {
    societyType: 'Residential',
    constructionYear: '2018',
    amenities: ['Swimming Pool', 'Gym', 'Club House', 'Security'],
    parkingSpaces: 150,
    securityDeposit: 50000,
    monthlyMaintenance: 2500,
  },
};

interface ApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  type: 'approve' | 'reject';
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  onClose,
  onConfirm,
  type,
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
              title="Cancel"
              onPress={onClose}
              variant="outline"
              className="flex-1"
            />
            <Button
              title={type === 'approve' ? 'Approve' : 'Reject'}
              onPress={handleConfirm}
              variant={type === 'approve' ? 'primary' : 'outline'}
              className={`flex-1 ${type === 'reject' ? 'border-red-300 bg-red-50' : ''}`}
              textClassName={type === 'reject' ? 'text-red-700' : ''}
              disabled={type === 'reject' && !notes.trim()}
            />
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
  const [request] = useState(mockRequestDetail);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');

  const handleApprove = () => {
    setApprovalType('approve');
    setShowApprovalModal(true);
  };

  const handleReject = () => {
    setApprovalType('reject');
    setShowApprovalModal(true);
  };

  const handleConfirmAction = (notes: string) => {
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
  };

  const handleDownloadDocument = (documentName: string) => {
    // Implement document download
    console.log('Download document:', documentName);
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

  const statusConfig = getStatusConfig(request.status);

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Review Application" 
        subtitle={request.societyName}
        showBack
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-900">
                {request.societyName}
              </Text>
              <Text className="text-sm text-gray-600">
                Code: {request.societyCode}
              </Text>
            </View>
            
            <View className={cn(
              'flex-row items-center px-3 py-1 rounded-full',
              statusConfig.color
            )}>
              {statusConfig.icon}
              <Text className="text-sm font-medium ml-1 capitalize">
                {request.status.replace('_', ' ')}
              </Text>
            </View>
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
                  {request.adminName}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Mail size={14} color="#6b7280" />
                <Text className="text-sm text-gray-900 ml-2">
                  {request.adminEmail}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Phone size={14} color="#6b7280" />
                <Text className="text-sm text-gray-900 ml-2">
                  {request.adminPhone}
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
                  {request.societyAddress}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Total Units:</Text>
                <Text className="text-sm text-gray-900">{request.totalFlats}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Type:</Text>
                <Text className="text-sm text-gray-900">
                  {request.additionalInfo.societyType}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Built:</Text>
                <Text className="text-sm text-gray-900">
                  {request.additionalInfo.constructionYear}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Parking:</Text>
                <Text className="text-sm text-gray-900">
                  {request.additionalInfo.parkingSpaces} spaces
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Monthly Maintenance:</Text>
                <Text className="text-sm text-gray-900">
                  ₹{request.additionalInfo.monthlyMaintenance.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-sm font-medium text-gray-900 mb-2">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {request.additionalInfo.amenities.map((amenity, index) => (
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
              {request.submittedDocuments.map((doc, index) => (
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
        {request.verificationNotes && (
          <View className="px-4 pb-4">
            <Card className="p-4 bg-amber-50 border-amber-200">
              <View className="flex-row items-center mb-2">
                <MessageSquare size={16} color="#d97706" />
                <Text className="text-sm font-medium text-amber-800 ml-2">
                  Verification Notes
                </Text>
              </View>
              <Text className="text-sm text-amber-700">
                {request.verificationNotes}
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
                  {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Last Updated:</Text>
                <Text className="text-sm text-gray-900">
                  {new Date(request.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Days Pending:</Text>
                <Text className="text-sm text-gray-900">
                  {Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <View className="p-4 bg-white border-t border-gray-200">
          <View className="flex-row space-x-3">
            <Button
              title="Reject"
              onPress={handleReject}
              variant="outline"
              className="flex-1 border-red-300 bg-red-50"
              textClassName="text-red-700"
              icon={<XCircle size={16} color="#dc2626" />}
            />
            <Button
              title="Approve"
              onPress={handleApprove}
              variant="primary"
              className="flex-1"
              icon={<CheckCircle size={16} color="white" />}
            />
          </View>
        </View>
      )}

      {/* Approval/Rejection Modal */}
      <ApprovalModal
        visible={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleConfirmAction}
        type={approvalType}
      />
    </View>
  );
}